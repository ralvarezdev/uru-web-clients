import {COMPJS_SELECTORS, COMPJS_PATHS, COMPJS_VARIABLES_LIST} from "./compjs-props.js";

export class CompJS {
    // Unique instance
    static #INSTANCE;

    // Document elements
    #head;
    #style;

    // Styles
    #STYLES_MAP;

    // Loaded SVG files
    #LOADED_SVG

    // Elements
    #ELEMENTS_ID;

    constructor() {
        return CompJS.getInstance(this);
    }

    static getInstance(obj) {
        if (CompJS.#INSTANCE === undefined) {
            if (!obj instanceof CompJS)
                throw new Error("Object must be an instance of CompJS.");

            // Store head element
            obj.#head = document.querySelector('head');

            // Insert default CSS style to HTML
            obj.addStyleSheet(COMPJS_PATHS.BASE);

            // Custom CSS style
            obj.#checkStyleElement();
            obj.#STYLES_MAP = new Map();
            obj.#ELEMENTS_ID = new Map();
            obj.#LOADED_SVG=new Map()

            CompJS.#INSTANCE = obj;
        }
        return CompJS.#INSTANCE;
    }

    // - Utilities

    // Method to convert pixels to rem
    convertPixelsToRem(pixels) {
        return pixels / parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    // Method to check if the style element exists and is inside the head element
    #checkStyleElement() {
        if (this.#style === undefined) {
            this.#style = document.createElement('style');
            this.#style.id = COMPJS_SELECTORS.STYLE;
        }

        if (this.#head.contains(this.#style) === false)
            this.#head.appendChild(this.#style);
    }

    // Method to check if a variable is a string
    isString(variable) {
        return variable instanceof String || typeof (variable) === 'string';
    }

    // Method to check selectors
    checkSelector(selector) {
        if (!this.isString(selector))
            throw new Error('Class name must be a string...');
    }

    getFormattedClassName(selector) {
        this.checkSelector(selector)
        return selector.startsWith(".") ? selector : ("." + selector);
    }

    getFormattedId(selector) {
        this.checkSelector(selector)
        return selector.startsWith("#") ? selector : ("#" + selector);
    }

    getSelectorWithElementId(selector, id) {
        this.checkSelector(id)
        return [COMPJS_SELECTORS.BASE, selector, id].join('--')
    }

    getFormattedClassNameWithElementId(selector, id) {
        const selectorWithId = this.getSelectorWithElementId(selector, id)
        return this.getFormattedClassName(selectorWithId)
    }

    getFormattedIdWithElementId(selector, id) {
        const selectorWithId = this.getSelectorWithElementId(selector, id)
        return this.getFormattedId(selectorWithId);
    }

    checkSelectors(selectors) {
        if (selectors === undefined)
            throw new Error('Selectors are undefined...');

        if (selectors.length === 0)
            throw new Error('Selectors list is empty...');


        selectors.forEach(selector => this.checkSelector(selector))
    }

    getFormattedClassNames(classNames) {
        this.checkSelectors(classNames)

        const formattedClassNames = new Array(classNames.length)

        classNames.forEach((className, i) => {
            formattedClassNames[i] = this.getFormattedClassName(className);
        })

        return formattedClassNames
    }

    // Methods to check property names
    checkPropertyName(propertyName) {
        if (!this.isString(propertyName))
            throw new Error('Property name must be a string...');
    }

    /*
    isCompJSPropertyNameValid(propertyName) {
        // Check if the given property name is valid
        this.checkPropertyName(propertyName);

        for (let validPropertyName of COMPJS_VARIABLES_LIST)
            if (validPropertyName === propertyName)
                return true;

        return false;
    }
    */

    // Methods to check property value
    checkPropertyValue(propertyValue) {
        if (!this.isString(propertyValue))
            throw new Error('Property value must be a string...');
    }

    // - Setters and getters

    // General methods for getting CSS classes properties values
    getElement(selector) {
        this.checkSelector(selector)
        return document.querySelector(selector);
    }

    getCompStyle(element){
        return (element === null) ? null : window.getComputedStyle(element);
    }

    getCompStyleFromSelector(selector) {
        const element = this.getElement(selector);

        return  getComputedStyle(element);
    }

    #getSelectorPropertyValue(selector, propertyName) {
        this.checkPropertyName(propertyName);

        const compStyle = this.getCompStyleFromSelector(selector);
        const propertyValue = compStyle.getPropertyValue(propertyName);

        return (propertyValue === undefined) ? null : propertyValue;
    }

    getSelectorPropertiesValues(selector, propertiesName) {
        this.checkSelector(selector);

        const selectorPropertiesMap = new Map();

        for (let propertyName of propertiesName) {
            let propertyValue = this.#getSelectorPropertyValue(selector, propertyName);

            if (selectorPropertiesMap.has(selector) === false) {
                selectorPropertiesMap.set(selector, new Map([[propertyName, propertyValue]]));
                continue;
            }

            selectorPropertiesMap.get(selector).set(propertyName, propertyValue);
        }

        return selectorPropertiesMap;
    }

    getCompJSRootPropertiesValues() {
        return this.getSelectorPropertiesValues(COMPJS_SELECTORS.ROOT, COMPJS_VARIABLES_LIST);
    }

    // Get element total height
    getElementTotalHeight(element) {
        const elementStyle = this.getCompStyle(element)
        return parseInt(elementStyle.marginTop) + parseInt(elementStyle.marginBottom) + element.offsetHeight
    }

    // General methods for setting CSS class property values
    setCompJSSelectorPropertyValue(selector, propertyName, propertyValue) {
        // Check parameters
        this.checkSelector(selector)
        this.checkPropertyName(propertyName);
        this.checkPropertyValue(propertyValue);

        // Add class property style
        if (this.#STYLES_MAP.has(selector) === false) {
            this.#STYLES_MAP.set(selector, new Map([[propertyName, propertyValue]]));
            return;
        }

        this.#STYLES_MAP.get(selector).set(propertyName, propertyValue);
    }

    setCompJSRootPropertyValue(propertyName, propertyValue) {
        this.setCompJSSelectorPropertyValue(COMPJS_SELECTORS.ROOT, propertyName, propertyValue);
    }

    setCompJSElementID(element, id) {
        this.checkSelector(id);

        if (this.#ELEMENTS_ID.get(id))
            throw new Error("Element ID has already being assigned...");

        this.#ELEMENTS_ID.set(id, element);
    }

    getCompJSElementID(elementId) {
        this.checkCompJSElementID(elementId);

        return this.#ELEMENTS_ID.get(elementId);
    }

    checkCompJSElementID(elementId){
        this.checkSelector(elementId);

        if (this.#ELEMENTS_ID.get(elementId)  === undefined)
            throw new Error("Element ID does not exist...");
    }

    setElementID(element, id) {
        if(id)
            element.id=id
    }

    addClassNames(element,...classNames){
        if(!classNames)
            return

        if(classNames instanceof Array){
            if(classNames.length===0)
                return

            this.checkSelectors(classNames);
            element.classList.add(...classNames);}
        else{
            this.checkSelector(classNames)
            element.classList.add(classNames)
        }
    }

    // - Links
    #addLink(rel, type, href, id) {
        // Create new link element for the stylesheet
        let link = document.createElement('link');

        // Set the attributes for link element
        link.rel = rel;
        link.type = type;
        link.href = href;

        this.setElementID(link, id);

        // Append link element to HTML head
        this.#head.appendChild(link);
    }

    addStyleSheet(path) {
        if (!path.endsWith('.css'))
            throw new Error("Invalid path to stylesheet, it must end with '.css'...");

        this.#addLink('stylesheet', 'text/css', path);
    }

    // - Resets

    // Reset all applied customized styles
    resetAllAppliedStyles() {
        this.#style.textContent = "";
    }

    // Reset map with customized styles
    resetStylesMap() {
        this.#STYLES_MAP = new Map();
    }

    // Reset applied customized styles for a given class name
    resetAppliedStyles(selector) {
        this.checkSelector(selector);

        // Reset styles for the given class name
        if (this.#STYLES_MAP.has(selector)) {
            this.#STYLES_MAP.delete(selector);

            // Reset style element content
            this.#STYLES_MAP.resetAllAppliedStyles();

            // Apply new styles
            this.#STYLES_MAP.applyStyles();
        }
    }

    // Apply customized styles to 'style' element
    applyStyles() {
        // Check styles map
        this.#checkStyleElement();

        // Append customized styles
        let newContent = "";

        for (let [selector, property] of this.#STYLES_MAP.entries()) {
            let newPropertyContent = `${selector} {\n`;

            for (let [propertyName, propertyValue] of property.entries())
                newPropertyContent += `${propertyName}: ${propertyValue};\n`;

            newPropertyContent += "}\n\n";
            newContent += newPropertyContent;
        }

        // Append element as head last child
        this.#head.appendChild(this.#style);

        // Apply customized styles
        this.#style.textContent = newContent;
    }

    // - Element initializers

    createElementWithId(tagName, parentElement, id, classNames) {
        const element = document.createElement(tagName);

        this.setElementID(element, id)
        this.addClassNames(element,...classNames)

        parentElement.appendChild(element);

        return element;
    }

    createElement(tagName, parentElement, ...classNames) {
        return this.createElementWithId(tagName, parentElement, null, classNames);
    }

    // - Loaders

    loadImgWithId(parentElement, url, alt, id, classNames) {
        const imgElement = document.createElement("img");
        imgElement.src = url;

        if (alt)
            imgElement.alt = alt;

        this.setElementID(imgElement, id)
        this.addClassNames(imgElement,...classNames)

        parentElement.appendChild(imgElement);

        return imgElement;
    }

    loadImg(parentElement, url, alt, classNames) {
        return this.loadImgWithId(parentElement, url, alt, null, classNames);
    }

    loadObjectWithId(parentElement, data, type, id, classNames) {
        const objectElement = document.createElement('object');

        if (data)
            objectElement.data = data;

        if (type)
            objectElement.type = type;

        this.setElementID(objectElement, id)
        this.addClassNames(objectElement,...classNames)

        parentElement.appendChild(objectElement);
        return objectElement;
    }

    loadObject(parentElement, data, type, ...classNames) {
        return this.loadObjectWithId(parentElement, data, type, null, classNames);
    }

    loadSVGImgWithId(parentElement, url, alt, id, ...classNames) {
        // Create SVG img element
        return this.loadImgWithId(parentElement, url, alt, id, classNames);
    }

    loadSVGImg(parentElement, url, alt, ...classNames) {
        return this.loadImg(parentElement, url, alt, classNames);
    }

    async loadHiddenSVG( url, viewBox, id) {
            // SVG already loaded
            if(this.#LOADED_SVG.get(id))
                return

            // Set SVG as being loaded
            this.#LOADED_SVG.set(id, true)

            // Create SVG element
            const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            // Create symbol element
            const symbolElement = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');

            this.setElementID(symbolElement, id)

            svgElement.appendChild(symbolElement);
            document.querySelector("body").appendChild(svgElement);

            fetch(url)
                .then(response => response.text())
                .then(svgData => {
                    const parser = new DOMParser();
                    const parsedSvg = parser.parseFromString(svgData, "image/svg+xml");

                    svgElement.version="2.0";
                    svgElement.classList.add(COMPJS_SELECTORS.HIDE)
                    symbolElement.setAttribute('viewBox', viewBox);

                    symbolElement.innerHTML=parsedSvg.documentElement.innerHTML;
                });
    }

    loadSVG(parentElement, id, ...classNames) {
        id=this.getFormattedId(id)
        const getHiddenSVG=document.querySelector(id);

        if(!getHiddenSVG)
            throw new Error("Hidden SVG element not found...");

        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        const useElement=document.createElementNS('http://www.w3.org/2000/svg', 'use');
        useElement.setAttribute('href', id);

        svgElement.appendChild(useElement);

        this.addClassNames(svgElement,...classNames)

        parentElement.appendChild(svgElement);

        return svgElement;
    }
}
