// define the object with {} (as opposed to [] for arrays)
const bindings = {};

/**
 * Define the function (object) app
 */
const app = () => {
    bindings.first = new Observable("John Smith");
    bindings.last = new Observable("");
    bindings.full = new Computed(() => `${bindings.first.value} ${bindings.last.value}`.trim(), [bindings.first, bindings.last]);
    applyBindings();
};

// run app() immediately
setTimeout(app, 0);

/**
 * Define the function (object) applyBindings
 */
const applyBindings = () => {

    // get a list of all HTML elements (each identified as "elem") with the attribute "data-bind" from the template and
    // cycle through each. Then bind the HTML element's "value" literal (i.e. the text input from HTML input element) to
    // the value of the observable in the "bindings" object.
    document.querySelectorAll("[data-bind]").forEach(elem => {

        // get the correct field (an observable) from "bindings" where its name index matches the literal to the HTML
        // element's "data-bind" attribute
        const obs = bindings[elem.getAttribute("data-bind")];

        // apply bidirectional data-binding to enable updates whenever changes are made to the object or to a DOM property
        bindValue(elem, obs);
    });
}

const bindValue = (input, observable) => {
    input.value = observable.value;
    observable.subscribe(() => input.value = observable.value);
    input.onkeyup = () => observable.value = input.value;
};

/**
 * Defines an observable attribute whereby one or more listeners are registered to the Observable, keeping track of the
 * value
 */
class Observable {

    /**
     * Builds an instance of an Observable, with an empty list (array) of listeners (subscribers) and the current value
     * @param value
     */
    constructor(value) {
        this._listeners = [];
        this._value = value;
    }

    /**
     * Goes through the list of listeners (subscribers) and notifies each of the current value. No defined return type.
     */
    notify() {
        this._listeners.forEach(listener => listener(this._value));
    }

    /**
     * Adds a listener to the end of the list of listeners before returning the (updated) number of listeners subscribed
     * @param listener
     */
    subscribe(listener) {
        this._listeners.push(listener);
    }

    /**
     * A "getter" for the value field
     * @returns {*}
     */
    get value() {
        return this._value;
    }

    /**
     * A "setter" for the value field; notifies all listeners post-update
     * @param val
     */
    set value(val) {
        if (val !== this._value) {
            this._value = val;
            this.notify();
        }
    }
}

/**
 * Extends from Observable. The field "value" related to Observable's "value" and "deps" (dependencies) is a list
 * (array) of Observables
 */
class Computed extends Observable {

    /**
     * Constructor for Computed. Builds an instance of Observable with the value provided,
     * @param value Observable field "value"
     * @param deps List of Observables as dependencies (that is, Observables that this Computed object depends on and
     * should subscribe to)
     */
    constructor(value, deps) {

        /**
         * Calls the Observable constructor (hence Computed has all class fields defined under Observable)
         */
        super(value());


        const listener = () => {
            this._value = value();
            this.notify();
        }

        // subscribe() is a JS PushManager method (and apparently experimental);
        // "listener" is defined above as parameters to subscribe()
        deps.forEach(dep => dep.subscribe(listener));
    }

    /**
     * The "value" getter
     * @returns {*}
     */
    get value() {
        return this._value;
    }

    /**
     * The "value" setter; this overrides any predefined setter and throws an exception whenever an attempt to change
     * "value" is carried out.
     * @param _
     */
    set value(_) {
        throw "Cannot set computed property";
    }
}