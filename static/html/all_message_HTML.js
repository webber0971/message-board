class all_message_HTML extends HTMLElement{

    connectedCallback(){
        this.innerHTML = `
            <div id="message"></div>
        `;
    };
    
};

customElements.define("all-message", all_message_HTML);