//  First define the objects (including functions) needed; objects with little to no dependencies go at the top

/**
 * Used to dynamically build templates. Apart from the constructor and static generator, all other methods return
 * the same instance; hence, one can daisy-chain method calls in sequence.
 */
class Wrapper {
    /**
     * Wrapper objects are characterised by three fields; the toggleDisplay method is used to update (refresh) the
     * template styling for the new element based on the value of "display" (defaults to true)
     * @param element
     * @param text
     * @param display
     */
    constructor(element, text, display = true) {
        this.element = document.createElement(element);
        this.element.innerHTML = text;
        this.display = !display;
        this.toggleDisplay();
    }

    /**
     * Adds an event listener "click" to the current HTML element
     * @param val
     * @returns {Wrapper}
     */
    click(val) {
        this.element.addEventListener("click", () => val());
        return this;
    }

    /**
     * Sets the mouse cursor style to "pointer" when the cursor hovers over the current element
     * @returns {Wrapper}
     */
    showSelectable() {
        this.element.style.cursor = "pointer";
        return this;
    }

    /**
     * Adds a class attribute to the current element
     * @param className
     * @returns {Wrapper}
     */
    addClass(className) {
        this.element.classList.add(className);
        return this;
    }

    /**
     * Toggles the current element's display style before updating the display style attribute to "" if true
     * and "none" if false
     * @returns {Wrapper}
     */
    toggleDisplay() {
        this.display = !this.display;
        this.element.style.display = this.display ? "" : "none";
        return this;
    }

    /**
     * Adds a child node element to the current element (which is also considered the parent node element)
     * @param child
     * @returns {Wrapper}
     */
    appendChild(child) {
        this.element.appendChild(child.element);
        return this;
    }

    /**
     * Creates a new element based on the parameters provided and appends it as a child node to the current element
     * @param element
     * @param text
     * @param display
     * @returns {Wrapper}
     */
    createChild(element, text, display = true) {
        var wrapper = new Wrapper(element, text, display);
        this.appendChild(wrapper);
        return this;
    }

    /**
     * Returns an instance of Wrapper
     * @param element
     * @param text
     * @param display
     * @returns {Wrapper}
     */
    static generate(element, text, display = true) {
        return new Wrapper(element, text, display);
    }
}

/**
 * Inherits Wrapper and is responsible for anchor tags.
 */
class AnchorWrapper extends Wrapper {
    constructor(href, text, target = "_blank") {
        super("a", text);
        this.element.href = href;
        this.element.target = target;
    }

    /**
     * Returns an instance of an anchor tag (defaults "target" to "_blank")
     */
    static generate(href, text, target = "_blank") {
        return new AnchorWrapper(href, text, target);
    }
}

/**
 * Renders each domain user and post, using a consistent sequence of HTML elements
 * @param post
 * @param user
 * @returns {any}
 */
const renderPost = (post, user) => {

    const bodyDiv = Wrapper.generate("div", "", false)
        .createChild("p", post.body)
        .appendChild(Wrapper.generate("p", user.username).addClass("tooltip")
            .appendChild(Wrapper.generate("span", `${user.name} `)
                .appendChild(AnchorWrapper.generate(`mailto:${user.email}`, user.email))
                .createChild("br", "")
                .appendChild(AnchorWrapper.generate(
                    `https://maps.google.com?q=${user.address.geo.lat}, ${user.address.geo.lng}`,
                    "🌎 Locate"))
                .addClass("tooltiptext")));

    return Wrapper.generate("div", "")
        .addClass("post")
        .appendChild(Wrapper.generate("h1", `${user.username} &mdash; ${post.title}`)
            .showSelectable()
            .click(() => bodyDiv.toggleDisplay()))
        .appendChild(bodyDiv)
        .element;
};

/**
 * Fetches the data from the endpoint and saves it to the model
 * @param model Object that stores the response (as JSON)
 * @param domain Path parameter as part of the JsonPlaceHolder (dummy) web service
 * @param done A function called after the model is saved
 */
const get = (model, domain, done) => {
    fetch(`https://jsonplaceholder.typicode.com/${domain}`)
        // "response" represents what was returned by the Promise and can be called anything
        .then(response => response.json())
        // again, "json" represents whatever was returned at the previous Promise
        .then(json => {
            // uses named indices, so each domain is assigned a corresponding response; this actually forces "model"
            // to represent an object and NOT an array. The object would have fields that match each index name.
            model[domain] = json;
            done();
        });
};

/**
 * Get a handle on the div element "app"
 * @type {HTMLElement}
 */
const app = document.getElementById("app");

/**
 * Define a method run(), that ultimately calls get() and defines the done() method as another get() (i.e. becomes
 * recursive). In effect, this gets the "users" first and the "posts" last from the web service, and then contributes
 * to the template construction
 * @param model
 */
const run = (model) => get(model, "users", () =>
    get(model, "posts",
        // terminating done()
        () => {
            // as mentioned, model is actually an object with fields that match the "domain" names
            model.users.forEach(user => model.userIdx[user.id] = user);
            app.innerText = '';
            model.posts.forEach(post =>
                // the definition for renderPost() is provided below
                app.appendChild(renderPost(post, model.userIdx[post.userId])));
        }));

/**
 * Builds an instance of Wrapper (defined below), and builds a list based on all elements in "model", each with access
 * to the run() method defined
 */
app.appendChild(
    Wrapper.generate("button", "Load")
        .click(() => run({userIdx: {}})
        ).element);

