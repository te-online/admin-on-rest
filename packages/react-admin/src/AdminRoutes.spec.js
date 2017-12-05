import React from 'react';
import { Route, MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render, shallow } from 'enzyme';
import { html } from 'cheerio';
import assert from 'assert';

import { AdminRoutes } from './AdminRoutes';

describe('<AdminRoutes>', () => {
    const Dashboard = () => <div>Dashboard</div>;
    const PostList = () => <div>PostList</div>;
    const PostEdit = () => <div>PostEdit</div>;
    const PostCreate = () => <div>PostCreate</div>;
    const PostShow = () => <div>PostShow</div>;
    const PostDelete = () => <div>PostDelete</div>;
    const Custom = () => <div>Custom</div>;
    // the Provider is required because the dashboard is wrapped by <Restricted>, which is a connected component
    const store = createStore(x => x);
    const resources = [
        {
            name: 'posts',
            list: PostList,
            edit: PostEdit,
            create: PostCreate,
            show: PostShow,
            remove: PostDelete,
        },
    ];
    it('should show dashboard on / when provided', () => {
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']}>
                    <AdminRoutes
                        dashboard={Dashboard}
                        resources={resources}
                        declareResources={() => true}
                    />
                </MemoryRouter>
            </Provider>
        );
        assert.equal(html(wrapper), '<div>Dashboard</div>');
    });
    it('should show resource list on /[resourcename]', () => {
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/posts']}>
                    <AdminRoutes
                        resources={resources}
                        declareResources={() => true}
                    />
                </MemoryRouter>
            </Provider>
        );
        assert.equal(html(wrapper), '<div>PostList</div>');
    });
    it('should show resource edit on /[resourcename]/:id', () => {
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/posts/12']}>
                    <AdminRoutes
                        resources={resources}
                        declareResources={() => true}
                    />
                </MemoryRouter>
            </Provider>
        );
        assert.equal(html(wrapper), '<div>PostEdit</div>');
    });
    it('should show resource show on /[resourcename]/:id/show', () => {
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/posts/12/show']}>
                    <AdminRoutes
                        resources={resources}
                        declareResources={() => true}
                    />
                </MemoryRouter>
            </Provider>
        );
        assert.equal(html(wrapper), '<div>PostShow</div>');
    });
    it('should show resource delete on /[resourcename]/:id/delete', () => {
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/posts/12/delete']}>
                    <AdminRoutes
                        resources={resources}
                        declareResources={() => true}
                    />
                </MemoryRouter>
            </Provider>
        );
        assert.equal(html(wrapper), '<div>PostDelete</div>');
    });
    it('should accept custom routes', () => {
        const customRoutes = [<Route path="/custom" component={Custom} />]; // eslint-disable-line react/jsx-key
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/custom']}>
                    <AdminRoutes
                        resources={resources}
                        customRoutes={customRoutes}
                        declareResources={() => true}
                    />
                </MemoryRouter>
            </Provider>
        );
        assert.equal(html(wrapper), '<div>Custom</div>');
    });

    it('should accept a function as children and declare the returned resources', async () => {
        const userCheck = jest.fn();
        const declareResources = jest.fn();
        const children = jest.fn(() =>
            resources.map(resource => (
                <Foo {...resource} /> // eslint-disable-line react/jsx-key
            ))
        );
        const Foo = () => <span />;
        await shallow(
            <AdminRoutes
                userCheck={userCheck}
                permissions="permissions"
                declareResources={declareResources}
            >
                {children}
            </AdminRoutes>
        )
            .instance()
            .componentWillReceiveProps({
                children,
                permissions: 'newPermissions',
                declareResources,
            });

        assert.deepEqual(children.mock.calls[0][0], 'newPermissions');
        assert.deepEqual(declareResources.mock.calls[0][0], resources);
    });

    it('should accept a promise as children and declare the returned resources', async () => {
        const userCheck = jest.fn();
        const declareResources = jest.fn();
        const Foo = () => <span />;

        const children = jest.fn(() =>
            Promise.resolve(
                resources.map(resource => (
                    <Foo {...resource} /> // eslint-disable-line react/jsx-key
                ))
            )
        );

        await shallow(
            <AdminRoutes
                userCheck={userCheck}
                permissions="permissions"
                declareResources={declareResources}
            >
                {children}
            </AdminRoutes>
        )
            .instance()
            .componentWillReceiveProps({
                children,
                permissions: 'newPermissions',
                declareResources,
            });

        assert.deepEqual(children.mock.calls[0][0], 'newPermissions');
        assert.deepEqual(declareResources.mock.calls[0][0], resources);
    });
});
