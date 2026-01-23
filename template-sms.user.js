// ==UserScript==
// @name        Template SMS for Google Messages
// @description Save SMS templates within Google Messages
// @version     1.1
// @updateURL   https://raw.githubusercontent.com/drylynch/template-sms-for-google-messages/main/template-sms.user.js
// @downloadURL https://raw.githubusercontent.com/drylynch/template-sms-for-google-messages/main/template-sms.user.js
// @icon        https://ssl.gstatic.com/android-messages-web/images/2022.3/2x/messages_2022_96dp.png
// @match       https://messages.google.com/web/*
// @run-at      document-idle
// @grant       none
// @author      github.com/drylynch
// ==/UserScript==

// only tested on chrome but it should work in firefox..... probably......

// setup trustedHTML so we can edit innerHTML in chrome
const escapeHTMLPolicy = window.trustedTypes.createPolicy('forceInner', {
    createHTML: (to_escape) => to_escape
})

// svg icons
const SVG_SIGN_ICON = escapeHTMLPolicy.createHTML(
`<svg viewBox='0 0 20 24'>
    <path d='M2 7V21C2 21.5523 2.44772 22 3 22H15C15.5523 22 16 21.5523 16 21V16.4142L12.7071 19.7071C12.5196 19.8946 12.2652 20 12 20H5C4.44772 20 4 19.5523 4 19C4 18.4477 4.44772 18 5 18H8V16C8 15.7348 8.10536 15.4804 8.29289 15.2929L16 7.58579V3C16 2.44772 15.5523 2 15 2H7V6C7 6.55228 6.55228 7 6 7H2zM5 5V2.12602C3.59439 2.4878 2.4878 3.59439 2.12602 5H5zM18 21C18 22.6569 16.6569 24 15 24H3C1.34315 24 0 22.6569 0 21V6C0 2.68629 2.68629 0 6 0H15C16.6569 0 18 1.34315 18 3V6C18.2559 6 18.5118 6.09763 18.7071 6.29289L21.7071 9.29289C22.0976 9.68342 22.0976 10.3166 21.7071 10.7071L18 14.4142V21zM11.5858 18L19.5858 10L18 8.41421L10 16.4142V18H11.5858z'/>
</svg>`
)
const SVG_EDIT_ICON = escapeHTMLPolicy.createHTML(
`<svg viewBox='0 0 24 24'>
    <path d='M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V12C22 11.4477 21.5523 11 21 11C20.4477 11 20 11.4477 20 12V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7C4 5.34315 5.34315 4 7 4H12C12.5523 4 13 3.55228 13 3C13 2.44772 12.5523 2 12 2H7Z'/>
    <path d='M20.2071 3.79312C18.9882 2.57417 17.0119 2.57417 15.7929 3.79312L8.68463 10.9014C8.30015 11.2859 8.0274 11.7676 7.89552 12.2951L7.02988 15.7577C6.94468 16.0985 7.04453 16.459 7.29291 16.7073C7.54129 16.9557 7.90178 17.0556 8.24256 16.9704L11.7051 16.1047C12.2326 15.9729 12.7144 15.7001 13.0988 15.3156L20.2071 8.20733C21.4261 6.98838 21.4261 5.01207 20.2071 3.79312ZM17.2071 5.20733C17.645 4.76943 18.355 4.76943 18.7929 5.20733C19.2308 5.64524 19.2308 6.35522 18.7929 6.79312L11.6846 13.9014C11.5565 14.0296 11.3959 14.1205 11.2201 14.1644L9.37439 14.6259L9.83581 12.7802C9.87976 12.6044 9.97068 12.4438 10.0988 12.3156L17.2071 5.20733Z'/>
</svg>`
)
const SVG_DELETE_ICON = escapeHTMLPolicy.createHTML(
`<svg viewBox='0 0 24 24'>
    <path d='M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17' stroke='#000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/>
</svg>`
)

// force reply box height
var msgboxHeight = 160  // height in px
const ROOTVAR_TEXTAREA_HEIGHT = '--force-textarea-height-px'  // css root variable

// mouse down state for checking if we should close the box
var mouseDownOutside = false

// html id for the sig selector elm
const ID_SIGSELECTOR = 'sig-selector'

// vanilla css classes we can add to our own buttons, piggyback on vanilla styles
const classListButton = [
    'mdc-button',
    'mat-mdc-raised-button'
]
const classListButtonPrimary = [
    'mdc-button',
    'mat-mdc-raised-button',
    'mat-primary'
]

// nav tab names ( VIEWS key -> tab name)
const TABS = {
    templates: 'Templates',
    settings: 'Settings',
}

// all gui views
const VIEWS = {
    templates: 'templates',  // show all templates, select and use them
    settings: 'settings',  // program settings
    addnew: 'addnew',  // create new template
    edit: 'edit',  // edit existing template
}

// wow so pretty
const ALL_CSS = `:root {
    --force-textarea-height-px: ${msgboxHeight}px;
    --bottom-anchor-offset-inline: 45px;
    --bottom-anchor-offset-stacked: 90px;
}

/* force sms box height */
mws-autosize-textarea {
    height: var(--force-textarea-height-px) !important;
    textarea {
        height: var(--force-textarea-height-px) !important;
    }
}

/* also need to bump the bottom up a bit so textbox doesn't overlap it */
.bottom-anchored-content {
    padding-bottom: calc(var(--force-textarea-height-px) + var(--bottom-anchor-offset-inline)) !important;
}
/* higher up for narrower screens */
@media (max-width: 959px ) {
    .bottom-anchored-content {
        padding-bottom: calc(var(--force-textarea-height-px) + var(--bottom-anchor-offset-stacked)) !important;
    }
}

/* light theme (no body class) */
body {
    --box-bg-color: white;
    --box-shadow: 0 0 2px rgba(0, 0, 0, .3), 0 2px 16px rgba(0, 0, 0, .6);
    --border-color: #DADCE0;

    --inactive-strong: #5F6368;
    --inactive-light: #bbb;

    --active-strong: #1E7AE3;
    --active-light: #8ab4f8;
    --active-bg: #E4EFFB;

    --hover-bg: #F6FAFE;

    --strong-font-color: white;
    --light-font-color: black;
    --body-font-color: var(--inactive-strong);
}

/* dark theme */
body.dark-theme #sig-selector {
    --box-bg-color: #3c4043;
    --box-shadow: 0 0 2px rgba(0, 0, 0, .3), 0 2px 16px rgba(0, 0, 0, .6);
    --border-color: #5f6368;

    --inactive-strong: #959595;
    --inactive-light: #DADCE0;

    --active-strong: #4f8ef4;
    --active-light: #8ab4f8;
    --active-bg: #464E58;

    --hover-bg: #44484B;

    --strong-font-color: black;
    --light-font-color: black;
    --body-font-color: var(--inactive-light);
}

/* high contrast theme */
body.high-contrast-theme #sig-selector {
    --box-bg-color: white;
    --box-shadow: 0 0 2px rgba(0, 0, 0, .3), 0 2px 16px rgba(0, 0, 0, .6);
    --border-color: black;

    --inactive-strong: black;
    --inactive-light: #ddd;

    --active-strong: #1E7AE3;
    --active-light: #8ab4f8;
    --active-bg: #E4EFFB;

    --hover-bg: #F6FAFE;

    --strong-font-color: white;
    --light-font-color: black;
    --body-font-color: var(--inactive-strong);
}


/* normalise */
#sig-selector * {
    font-family: 'Roboto';
    font-style: normal;
    user-select: none;
    font-size: 1em;
}


/* main box */
#sig-selector {
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 999;
    width: 400px;
    height: 340px;
    border-radius: 20px;

    background-color: var(--box-bg-color);
    box-shadow: var(--box-shadow);


    /* top tabs */
    nav {
        display: flex;
        flex-direction: row;
        padding: 0px 20px;
        gap: 8px;
        color: var(--body-font-color);
        border-bottom: 1px solid var(--border-color);
    }
    nav > div {
        padding: 8px 6px;
        border-bottom: 2px transparent solid;
        font-weight: 450;
    }
    nav > div:hover {
        cursor: pointer;
        background-color: var(--hover-bg);
    }
    nav > div.active {
        color: var(--active-strong);
        border-bottom: 2px var(--active-strong) solid;
        background-color: var(--active-bg);
    }


    /* content container */
    main {
        overflow: auto;
        padding-left: 0px;
    }


    /* generic content view */
    section {
        margin: 8px 8px;
    }


    /* message templates */
    #section-templates:not(:has(article)):before {  /* message for empty templates view */
        height: 230px;
        display: flex;
        justify-content: center;
        align-items: center;
        content: "Click the 'Add New' button to add a new SMS template";
        font-size: 1.2em;
        text-align: center;
        padding: 0 70px;
        color: var(--inactive-strong);
    }

    #section-templates {
        display: flex;
        flex-direction: column;
        gap: 8px;

        article {
            display: flex;
            flex-direction: row;
            gap: 2px;

            /* no handles till i figure out how to do it nicely... no reordering for now... */
            .handle {
                width: 30px;
                background-color: pink;
            }
            .handle:hover {
                cursor: grab;
            }
            .handle:active {
                cursor: grabbing;
            }
        }

        article:has(.handle:hover) {
            --hover-distance: 2px;
            position: relative;
            bottom: var(--hover-distance);
            left: var(--hover-distance);
            margin-bottom: var(--hover-distance);
            margin-left: calc(6px + var(--hover-distance));  /* +6px is something to do with the existing margin... */
        }

        .msg-preview {
            min-width: 0;  /* prevent horizontal overflow */
            width: 100%;
            border-radius: 4px;

            .title-text {
                font-weight: bold;
                padding: 4px;
                border-radius: 4px 4px 0 0;
                background-color: var(--inactive-strong);
                color: var(--strong-font-color)
            }

            .body-text {
                padding: 4px;
                max-width: 100%;
                max-height: 3.4em;
                word-wrap: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                border-radius: 0 0 4px 4px;
                background-color: var(--inactive-light);
                color: var(--light-font-color)
            }
        }

        .msg-preview:hover {
            cursor: pointer;

            .title-text {
                background-color: var(--active-strong);
            }

            .body-text {
                background-color: var(--active-light);
            }
        }


        .msg-controls {
            display: flex;
            gap: 2px;

            .msg-edit, .msg-delete {
                display: flex;
                width: 30px;
                padding: 0;
                background: var(--inactive-light);
                border: 0px solid transparent;
                border-radius: 4px;
                justify-content: center;
            }

            .msg-edit:hover, .msg-delete:hover {
                background: var(--active-light);
            }

            .msg-edit:active, .msg-delete:active {
                background: var(--active-strong);
            }

            /* tooltip - disabled for now since it doesn't scroll properly */
/*             .msg-edit:before, .msg-delete:before {
                position: absolute;
                padding: 5px;
                transform: translateY(-25px);
                text-align: center;
                border-radius: 10px;
                pointer-events: none;
                transition: 0.2s;
                opacity: 0;
                background: var(--inactive-strong);
                color: var(--strong-font-color);
            }
            .msg-edit:hover:before, .msg-delete:hover:before {
                opacity: 1;
            }
            .msg-edit:before {
                content: 'Edit'
            }
            .msg-delete:before {
                content: 'Delete'
            } */
        }
    }


    /* add / edit message view */
    #section-addnew {
        display: flex;
        flex-direction: column;
        color: var(--body-font-color);

        input, textarea {
            margin-bottom: 8px;
        }

        textarea {
            overflow-y: auto;
            resize: none;
            height: 160px;
            scrollbar-color: var(--inactive-strong) white;
        }
    }


    footer {
        display: flex;
        gap: 10px;
        padding: 5px 20px;
        border-top: 1px solid var(--border-color);
    }


    button {
        cursor: pointer;
    }
}
`





/* UTIL */


/* say hello in console */
function announceScript() {
    console.log('%cSMS signatures extension loaded', 'background:black; color:skyblue;')
}


/* get/set css root variables */
function getRootVar(name) {
    return getComputedStyle(document.querySelector(':root')).getPropertyValue(name)
}
function setRootVar(name, value) {
    document.querySelector(':root').style.setProperty(name, value)
}


/* add our lovely css */
function addCSS() {
    let style = document.createElement('style')
    style.textContent = ALL_CSS
    document.head.append(style)
}




/* PAGE STATE */


/* add button to message pages */
async function urlChangeCallback() {
    // the new navigation api seems to work too fast for this website
    // without a timeout, this feeds us the LAST location.href we visited, since location seems to get updated AFTER this callback...
    // this short delay fixes it. probably. could bump it up to a few hundred ms if we're really worried about it but 50 works fine
    await new Promise(r => setTimeout(r, 50))

    console.debug('new url: ' + location.href)

    // ignore non-conversation pages
    const onConversationURL = Boolean(location.href.split('/').at(-2) === 'conversations')  // match url ending in 'conversations/[some convo ID]'
    if (!onConversationURL) {
        console.debug('not a conversation, ignoring')
        return
    }

    // ignore new conversations we're in the process of creating
    const onNewConversationURL = Boolean(location.href.split('/').at(-1) === 'new')  // match url ending in '/new'
    if (onNewConversationURL) {
        console.debug('new conversation, ignoring')
        return
    }

    // ignore read-only conversations, like from shortcodes
    const isReadonly = Boolean(document.getElementsByClassName('compose-readonly').length)  // .compose-readonly is only present on readonly convos
    if (isReadonly) {
        console.debug('readonly conversation, ignoring')
        return
    }

    addSignatureButtons()
}


/* mutation observer to wait for element to exist. stolen from https://stackoverflow.com/a/61511955 */
function waitForElm(selector) {
    console.debug(`waiting for element with queryselector '${selector}'`)
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect()
                resolve(document.querySelector(selector))
            }
        })
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    })
}




/* PAGE MODIFICATION */


/* add our new button next to the others */
async function addSignatureButtons() {
    // grab all parents (for different screen width views)
    const selector = 'mws-message-compose-picker-buttons'

    // wait for the elements to actually arrive first, then grab all of them
    // we want multiple elms, but waitForElm will only give us one... once we KNOW it's there though, we can just querySelectorAll
    await waitForElm(selector)
    let parents = document.getElementsByTagName(selector)
    console.debug(`found ${parents.length} parent elms`)

    if (!parents.length) {
        console.warn("# can't add sig buttons: no parents...")
        return
    }

    for (let parent of parents) {
        // already has button, skip
        if (parent.getElementsByClassName('signature-button').length) {
            continue
        }

        let button = parent.firstChild.cloneNode(true)
        button.classList.add('signature-button')
        button.title = 'Add template'
        button.setAttribute('aria-label', 'Open signatures')
        button.setAttribute('data-e2e-picker-button', 'SIGNATURES')
        button.getElementsByClassName('picker-icon')[0].innerHTML = SVG_SIGN_ICON

        // toggle visibility on click
        button.addEventListener('click', () => {
            if (sigSelector.isVisible()) {
                sigSelector.hide()
            } else {
                sigSelector.show()
            }
        })

        parent.insertAdjacentElement('afterbegin', button)
    }
}


/* slap that text in there */
function setMessageContent(message) {
    // add message to input
    let textarea = document.getElementsByTagName('textarea')[0]
    textarea.value = message

    // simulate text input so the vanilla js updates size of textarea elm
    // not necessary if we're forcing the size of the textarea but hey it's whatever
    const inputEvent = new Event('input', {'bubbles':true, 'cancelable':false})
    textarea.dispatchEvent(inputEvent)
}




/* STORAGE */

// format in localstorage:
//   templates: { templateName: bodyText }
//   order: templateNames[], order defined by index

const sigStorage = {
    KEY_TEMPLATES: 'sigselector-templates',

    /* read everything stored at our key */
    readAllTemplates: () => {
        return JSON.parse(localStorage.getItem(sigStorage.KEY_TEMPLATES)) || {}  // default empty dict
    },

    /* overwrite all data at key */
    writeAllTemplates: (templates) => {
        localStorage.setItem(sigStorage.KEY_TEMPLATES, JSON.stringify(templates))
    },

    /* delete all templates in storage */
    deleteAllTemplates: () => {
        localStorage.removeItem(sigStorage.KEY_TEMPLATES)
    },

    /* return specific message body at name. return undefined if not in storage */
    readTemplate: (name) => {
        return sigStorage.readAllTemplates()[name]
    },

    /* store specific message body at name. will overwrite if already there */
    writeTemplate: (name, body) => {
        let templates = sigStorage.readAllTemplates()
        templates[name] = body
        sigStorage.writeAllTemplates(templates)
    },

    /* delete specific message at name. does nothing if name not found */
    deleteTemplate: (name) => {
        let templates = sigStorage.readAllTemplates()
        delete templates[name]
        sigStorage.writeAllTemplates(templates)
    },


    KEY_ORDER: 'sigselector-order',

    /* return current order of template keys */
    readAllOrder: () => {
        return JSON.parse(localStorage.getItem(sigStorage.KEY_ORDER)) || []  // default empty list
    },

    /* write given order to storage */
    writeAllOrder: (order) => {
        localStorage.setItem(sigStorage.KEY_ORDER, JSON.stringify(order))
    },

    /* burn it all please */
    deleteAllOrder: () => {
        localStorage.removeItem(sigStorage.KEY_ORDER)
    },

    /* add this entry to end of the order */
    appendToOrder: (newEntry) => {
        let order = sigStorage.readAllOrder()
        order.push(newEntry)
        sigStorage.writeAllOrder(order)
    },

    /* remove this entry from the order */
    removeFromOrder: (oldEntry) => {
        let order = sigStorage.readAllOrder()
        order = order.filter((entry) => {
            return entry != oldEntry
        })
        sigStorage.writeAllOrder(order)
    },

    /* replace oldEntry with newEntry in the order. used when editing an existing template to let it remain in the same place in the order */
    replaceInOrder: (oldEntry, newEntry) => {
        let order = sigStorage.readAllOrder()
        let index = order.indexOf(oldEntry)
        if (index > -1) {
            order[index] = newEntry
        }
        sigStorage.writeAllOrder(order)
    }
}




/* GUI */


/* popup box controller */
const sigSelector = {

    /* return element ID for this view key */
    getSectionIDFromKey: (key) => {
        return `section-${key}`
    },
    getFooterIDFromKey: (key) => {
        return `footer-${key}`
    },


    /* birth */
    create: () => {
        let aside = document.createElement('aside')
        aside.id = ID_SIGSELECTOR
        aside.style.display = 'none'  // start hidden, element's 'display:none' takes priority over injected stylesheet

        // navigation tabs
        let nav = document.createElement('nav')
        Object.entries(TABS).forEach((tabkey) => {
            const key = tabkey[0]
            const name = tabkey[1]
            let tab = document.createElement('div')
            tab.innerText = name
            tab.id = `tab-${key}`
            tab.addEventListener('click', () => {
                console.debug(`tab clicked: ${name}`)
                sigSelector.showView(key)
            })
            nav.append(tab)
        })
        aside.append(nav)

        // container for all sections
        let main = document.createElement('main')
        aside.append(main)


        // init all views, hidden by default

        /* VIEW: templates */

        let sectionTemplates = document.createElement('section')
        sectionTemplates.id = sigSelector.getSectionIDFromKey(VIEWS.templates)
        sectionTemplates.style.display = 'none'

        // footer for control buttons
        let footerTemplates = document.createElement('footer')
        footerTemplates.id = sigSelector.getFooterIDFromKey(VIEWS.templates)
        footerTemplates.style.display = 'none'

        // add new template
        let btnAddNew = document.createElement('button')
        btnAddNew.innerText = 'Add New'
        btnAddNew.classList.add(...classListButtonPrimary)
        btnAddNew.addEventListener('click', () => {
            sigSelector.showView(VIEWS.addnew)
            document.getElementById('sig-edit-name').focus()
        })

        footerTemplates.append(
            btnAddNew
        )



        /* VIEW: settings */

        let sectionSettings = document.createElement('section')
        sectionSettings.id = sigSelector.getSectionIDFromKey(VIEWS.settings)
        sectionSettings.style.display = 'none'

        // placeholder
        // sectionSettings.innerText = 'SETTINGS!!!!!!!!!!!!!!!!!!!!!'

        let settingsDeleteallButton = document.createElement('button')
        settingsDeleteallButton.innerText = 'Delete all templates'
        settingsDeleteallButton.classList.add(...classListButtonPrimary)
        settingsDeleteallButton.addEventListener('click', () => {
            if (confirm('Really delete all templates? This cannot be undone.')) {
                sigStorage.deleteAllTemplates()
                sigStorage.deleteAllOrder()
                sigSelector.showView(VIEWS.templates)
            }
        })

        sectionSettings.append(
            settingsDeleteallButton
        )



        /* VIEW - add new, edit existing */

        let sectionAddnew = document.createElement('section')
        sectionAddnew.id = sigSelector.getSectionIDFromKey(VIEWS.addnew)
        sectionAddnew.style.display = 'none'

        // hidden data inputs
        let prevNameInput = document.createElement('input')  // stores previous name when editing an existing template, for updating it
        prevNameInput.type = 'hidden'
        prevNameInput.id = 'sig-edit-prevname'
        let modifiedInput = document.createElement('input')  // value is set when user modifies anything. allows for smoother cancelling when no changes are made
        modifiedInput.type = 'hidden'
        modifiedInput.id = 'sig-edit-modified'

        // name label & input
        let nameLabel = document.createElement('label')
        nameLabel.setAttribute('for', 'sig-edit-name')
        nameLabel.innerText = 'Template Name'
        let nameInput = document.createElement('input')
        nameInput.setAttribute('maxlength', 30)
        nameInput.type = 'text'
        nameInput.id = 'sig-edit-name'
        // update modified field on text entry
        nameInput.addEventListener('input', () => {
            if (!modifiedInput.value) {
                modifiedInput.value = '1'
            }
        })

        // message label & textarea
        let bodyLabel = document.createElement('label')
        bodyLabel.setAttribute('for', 'sig-edit-body')
        bodyLabel.innerText = 'Message Text'
        let bodyInput = document.createElement('textarea')
        bodyInput.id = 'sig-edit-body'
        bodyInput.addEventListener('input', () => {
            if (!modifiedInput.value) {
                modifiedInput.value = '1'
            }
        })

        sectionAddnew.append(
            nameLabel,
            nameInput,
            bodyLabel,
            bodyInput,
            prevNameInput,
            modifiedInput,
        )

        // footer for cancel/confirm buttons
        let footerAddnew = document.createElement('footer')
        footerAddnew.id = sigSelector.getFooterIDFromKey(VIEWS.addnew)
        footerAddnew.style.display = 'none'

        // cancel and return to template view
        let btnCancel = document.createElement('button')
        btnCancel.innerText = 'Cancel'
        btnCancel.classList.add(...classListButton)
        btnCancel.addEventListener('click', () => {
            // only warn user about cancelling, if...
            if (
                !(nameInput.value || bodyInput.value)  // nothing entered
                || !modifiedInput.value  // nothing modified
                || confirm('Discard changes?')  // user is cool with discarding changes
            ) {
                nameInput.value = ''  // reset
                bodyInput.value = ''
                prevNameInput.value = ''
                modifiedInput.value = ''
                sigSelector.showView(VIEWS.templates)
                return
            }
        })

        // confirm and save template
        let btnConfirm = document.createElement('button')
        btnConfirm.innerText = 'Save'
        btnConfirm.classList.add(...classListButtonPrimary)
        btnConfirm.addEventListener('click', () => {
            const oldName = prevNameInput.value.trim()
            const newName = nameInput.value.trim()
            const body = bodyInput.value.trim()

            // input validation
            if (!newName) {
                alert('Template name is required. Enter one, and try again.')
                return
            }
            if (!body) {
                alert('Message text is required. Enter it, and try again.')
                return
            }

            // editing an existing template, replace it
            if (oldName) {
                sigStorage.deleteTemplate(oldName)
                sigStorage.writeTemplate(newName, body)
                sigStorage.replaceInOrder(oldName, newName)
            }
            // brand new, store at bottom of list
            else {
                sigStorage.writeTemplate(newName, body)
                sigStorage.appendToOrder(newName)
            }

            // reset and leave
            nameInput.value = ''
            bodyInput.value = ''
            prevNameInput.value = ''
            modifiedInput.value = ''
            sigSelector.showView(VIEWS.templates)
        })

        footerAddnew.append(
            btnCancel,
            btnConfirm
        )

        // add everything to the main fell and throw him in the dom
        main.append(
            sectionTemplates,
            sectionSettings,
            sectionAddnew,
        )
        aside.append(
            footerTemplates,
            footerAddnew,
        )
        document.body.append(aside)

        // show initial contents on load
        sigSelector.showView(VIEWS.templates)

        // hide box when user clicks outside it
        // check if user completes a full click outside of the box, mouse down AND up
        // this prevents accidentally closing the box when e.g. selecting text (inside) and mouse moves outside
        // it's a bit silly but it works
        document.addEventListener('mousedown', (event) => {
            let aside = document.getElementById(ID_SIGSELECTOR)
            mouseDownOutside = aside.contains(event.target) ? false : true
            console.debug('mousedown outside: ' + mouseDownOutside)
        })
        document.addEventListener('mouseup', (event) => {
            let aside = document.getElementById(ID_SIGSELECTOR)
            let mouseUpOutside = aside.contains(event.target) ? false : true
            console.debug('mouseup outside: ' + mouseUpOutside)
            if (sigSelector.isVisible() && mouseDownOutside && mouseUpOutside) {
                console.debug('CLOSING GUI')
                sigSelector.hide()
            }
        })
    },


    /* return template element from stored name & body */
    templateToHTML: (name, body) => {
        let article = document.createElement('article')

        let msgPreview = document.createElement('div')
        msgPreview.classList.add('msg-preview')
        msgPreview.addEventListener('click', () => {
            setMessageContent(body)
            sigSelector.hide()
        })

        let nameElm = document.createElement('div')
        nameElm.innerText = name
        nameElm.classList.add('title-text')

        let bodyElm = document.createElement('div')
        bodyElm.innerText = body
        bodyElm.classList.add('body-text')

        msgPreview.append(
            nameElm,
            bodyElm
        )

        let msgControls = document.createElement('div')
        msgControls.classList.add('msg-controls')

        // edit this message
        let btnEdit = document.createElement('button')
        btnEdit.innerHTML = SVG_EDIT_ICON
        btnEdit.classList.add('msg-edit')
        btnEdit.addEventListener('click', () => {
            sigSelector.showView(VIEWS.edit, name)
        })

        // delete this message
        let btnDelete = document.createElement('button')
        btnDelete.innerHTML = SVG_DELETE_ICON
        btnDelete.classList.add('msg-delete')
        btnDelete.addEventListener('click', () => {
            if (confirm(`Really delete template '${name}'?`)) {
                sigStorage.deleteTemplate(name)
                sigStorage.removeFromOrder(name)
                sigSelector.refreshTemplates()
            }
        })

        msgControls.append(
            btnEdit,
            btnDelete
        )

        // handle to grab and reorder
        // removed until i can figure a good simple way to move them around while dragging

        // let handle = document.createElement('div')
        // handle.classList.add('handle')
        // handle.addEventListener('mousedown', () => {
        //     handle.classList.add('moving')
        // })
        // handle.addEventListener('mouseup', () => {
        //     handle.classList.remove('moving')
        // })
        // handle.addEventListener('mousemove', () => {
        //     if (handle.classList.contains('moving')) {
        //         console.log('movin around!')
        //     }
        // })

        article.append(
            msgPreview,
            msgControls
        )

        return article
    },


    /* true if the sig selector box is currently visible */
    isVisible: () => {
        return document.getElementById(ID_SIGSELECTOR).style.display != 'none'
    },


    /* hello */
    show: () => {
        sigSelector.updateLocation()
        document.getElementById(ID_SIGSELECTOR).style.display = ''
        // add the 'open' class to button while open, which prevents the button from being clicked again (vanilla behaviour)
        // useful cause our stupid button will re-open immediately if you click the button to close it...
        Array.from(document.getElementsByClassName('signature-button')).forEach((elm) => {
            elm.classList.add('open')
        })
    },


    /* byebye */
    hide: () => {
        document.getElementById(ID_SIGSELECTOR).style.display = 'none'
        Array.from(document.getElementsByClassName('signature-button')).forEach((elm) => {
            elm.classList.remove('open')
        })
        // closeAttempts = 0  // reset
    },


    /* set location to the right place, based on parent row of buttons */
    updateLocation: () => {
        let aside = document.getElementById(ID_SIGSELECTOR)

        // bounds of button parent, who we'll be sitting relative to
        let bounds = document.querySelectorAll('.inline-compose-buttons.ng-star-inserted')[0].getBoundingClientRect()

        // inline buttons currently onscreen
        if (bounds.left > 0) {
            // sit diagonally perpendicular to the top left of the button row
            let bottom = window.innerHeight - bounds.top + 5 // lil 5px margin on bottom
            let right = window.innerWidth - bounds.left - 48  // each button is 48px wide... scooch over by one button width

            aside.style.left = ''  // unset
            aside.style.right = `${right}px`
            aside.style.bottom = `${bottom}px`  // sit above the buttonlist
        }

        // stacked buttons onscreen (smaller window)
        else {
            bounds = document.querySelectorAll('.stacked-compose-buttons.ng-star-inserted')[0].getBoundingClientRect()
            // sit directly on top of the button parent
            let bottom = window.innerHeight - bounds.top + 5 // lil 5px margin on bottom
            let left = bounds.left

            aside.style.right = ''  // unset
            aside.style.left = `${left}px`
            aside.style.bottom = `${bottom}px`
        }
    },


    /* navigate to the given view */
    showView: (navkey, msgName=null) => {
        console.debug(`SHOWVIEW | navkey: '${navkey}' | msgName: ${msgName}`)

        // hide everything
        Object.keys(VIEWS).forEach((viewkey) => {
            const ids = [
                sigSelector.getSectionIDFromKey(viewkey),
                sigSelector.getFooterIDFromKey(viewkey),
            ]
            ids.forEach((id) => {
                let elm = document.getElementById(id)
                if (elm) {  // ignore nonexistent elements (e.g. settings footer)
                    elm.style.display = 'none'
                }
            })
        })

        // clear active tabs
        Object.keys(TABS).forEach((tabkey) => {
            let tab = document.getElementById(`tab-${tabkey}`)
            if (tab) {
                tab.classList.remove('active')
            }
        })

        // highlight currently selected tab, if any
        let selectedTab = document.getElementById(`tab-${navkey}`)
        if (selectedTab) {
            selectedTab.classList.add('active')
        }

        // grab the right section ids
        let sectionID
        let footerID
        if (navkey === VIEWS.edit) {  // VIEWS.edit = VIEWS.addnew, with some extra logic (below)
            sectionID = sigSelector.getSectionIDFromKey(VIEWS.addnew)
            footerID = sigSelector.getFooterIDFromKey(VIEWS.addnew)
        } else {
            sectionID = sigSelector.getSectionIDFromKey(navkey)
            footerID = sigSelector.getFooterIDFromKey(navkey)
        }

        // extra view logic
        // start fresh with empty inputs
        if (navkey === VIEWS.addnew) {
            document.getElementById('sig-edit-name').value = ''
            document.getElementById('sig-edit-body').value = ''
        }
        // pull existing message data for editing
        else if (navkey === VIEWS.edit) {
            if (!msgName) {
                console.error('must pass message name if trying to edit a message!')
                return
            }
            const msgBody = sigStorage.readTemplate(msgName)
            document.getElementById('sig-edit-name').value = msgName
            document.getElementById('sig-edit-body').value = msgBody
            document.getElementById('sig-edit-prevname').value = msgName
        }
        // refresh templates
        else if (navkey === VIEWS.templates) {
            sigSelector.refreshTemplates()
        }

        // show this view
        document.getElementById(sectionID).style.display = ''
        let footer = document.getElementById(footerID)
        if (footer) {
            footer.style.display = ''
        }
    },


    /* push templates from storage into gui */
    refreshTemplates: () => {
        let parent = document.getElementById(sigSelector.getSectionIDFromKey(VIEWS.templates))
        parent.textContent = ''  // wipe

        // parse everything into elements
        const templates = sigStorage.readAllTemplates()
        let messageElms = new Map()
        Object.entries(templates).forEach((t) => {
            const name = t[0]
            const body = t[1]
            messageElms.set(
                name,
                sigSelector.templateToHTML(name, body)
            )
        })

        // slap em in, in order
        let nameOrder = sigStorage.readAllOrder()
        nameOrder.forEach((name) => {
            parent.append(messageElms.get(name))
        })
    }
}




function main() {
    announceScript()
    addCSS()

    // listen for URL changes so we can insert our signature button
    navigation.addEventListener('navigate', urlChangeCallback)

    // update location on window resize
    window.addEventListener('resize', sigSelector.updateLocation)

    // add the box, initially hidden
    sigSelector.create()
}

main()
