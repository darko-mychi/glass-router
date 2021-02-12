import React from "react";
import { Router as Base, HashRouter, Route, Switch } from "react-router-dom";
import ScrollTo from "./utils/ScrollTo";
import { createBrowserHistory } from "history";

interface IRoute {
    component: any,
    render: any,
    path: string,
    name: string,
    exact: boolean
};

interface IRouterOptions {
    routes: Array<IRoute>,
    mode: string,
    base: string,
    forceRefresh: false,
    getUserConfirmation: Window["confirm"],
    hashType: string,
    keyLength: Number,
    linkActiveClass: string,
    linkExactActiveClass: string,
    instance: Router|null,
    scrollBehavior: (savedPosition : {x: number, y: number}) => void,
};

/**
 * Easy peasy routing for react. Based on vue router.
 */
export default class Router {
    protected _defaultOptions: IRouterOptions = {
        routes: [],
        mode: "history",
        base: "/",
        forceRefresh: false,
        getUserConfirmation: window.confirm,
        hashType: "slash",
        keyLength: 6,
        linkActiveClass: "router-link-active",
        linkExactActiveClass: "router-link-exact-active",
        instance: null,
        scrollBehavior: (savedPosition : {x: number, y: number}) => {
            const {x, y} = savedPosition;
            ScrollTo(x, y);
        },
    };
    
    protected _options: IRouterOptions = {
        routes: [],
        mode: "history",
        base: "/",
        forceRefresh: false,
        getUserConfirmation: window.confirm,
        hashType: "slash",
        keyLength: 6,
        linkActiveClass: "router-link-active",
        linkExactActiveClass: "router-link-exact-active",
        instance: null,
        scrollBehavior: (savedPosition : {x: number, y: number}) => {
            const {x, y} = savedPosition;
            ScrollTo(x, y);
        },
    };

    protected beforeHooks = [];

    protected _history: any = null;

    constructor(options = {}) {
        this.options(options);
    }

    options(options: Array<Object>|Object) {
        if (Array.isArray(options)) {
            options = { routes: options };
        }

        this._options = {
            ...this._defaultOptions,
            ...options,
        };
    }

    /**
     * Generate JSX from defined routes
     */
    render() {
        const {
            mode, routes, base, forceRefresh, getUserConfirmation, keyLength, hashType
        } = this._options;

        let routerProps = {};

        if (this._options.mode === "history") {
            routerProps = {
                basename: base,
                forceRefresh,
                getUserConfirmation,
                keyLength,
            };

            this._history = createBrowserHistory(routerProps);
        } else {
            routerProps = {
                basename: base,
                hashType,
                getUserConfirmation,
            };
        }

        const children = (
            <>
                {/* <ScrollTo /> */}
                <Switch>
                    {routes.map((route, index) => {
                        let props: any = {};

                        if (route.component) {
                            props.component = route.component;
                        } else if (route.render) {
                            props.render = route.render;
                        }

                        return <Route
                            exact={route.exact || false}
                            path={route.path}
                            key={index}
                            {...props}
                        />
                    })}
                </Switch>
            </>
        );

        return mode === "hash" ? (
            <HashRouter {...routerProps}>
                {children}
            </HashRouter>
        ) : (
            <Base history={this._history} {...routerProps}>
                {children}
            </Base>
        );
    }

    /**
     * Register a router hook
     */
    registerHook (list: Array<Function|Object>, fn: Function) {
        list.push(fn);

        return function () {
            const i = list.indexOf(fn);

            if (i > -1) {
                list.splice(i, 1);
            }
        }
    }

    /**
     * Define middleware
     */
    beforeEach(fn: Function) {
        return this.registerHook(this.beforeHooks, fn);
    }

    /**
     * Internal route handler
     */
    getRoutePath(options: any) {
        const { routes } = this._options;
        let r = null;

        if (typeof options === "object") {
            routes.forEach((route) => {
                if (route.name === options.name) {
                    r = route.path;
                }
            });
            
            if (r === null) {
                return Error(`No route named ${options.name} was found!`);
            }
        }

        if (r === null) r = options;

        return r;
    }

    /**
     * Get the number of entries in the history stack
     */
    entries() {
        return this._history.length;
    }

    /**
     * Get the The current action (PUSH, REPLACE, or POP)
     */
    action() {
        return this._history.action;
    }

    /**
     * Navigate to a specific path
     */
    push(options: any, state = null) {
        const path = this.getRoutePath(options);

        return this._history.push(path, state);
    }

    /**
     * Replaces the current entry on the history stack
     */
    replace(options: any, state = null) {
        const path = this.getRoutePath(options);

        return this._history.replace(path, state);
    }

    /**
     * Moves the pointer in the history stack by n entries
     */
    go(n: any) {
        return this._history.go(n);
    }

    /**
     * Go back
     */
    back() {
        return this._history.go(-1);
    }

    /**
     * Go forward
     */
    forward() {
        return this._history.go(1);
    }

    /**
     * Go back
     */
    disable(prompt: any) {
        return this._history.block(prompt);
    }

    history() {
        return this._history;
    }
}
