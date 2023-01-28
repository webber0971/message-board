class submit_box_HTML extends HTMLElement{

    connectedCallback(){
        this.innerHTML = `
            <div>留言區</div>
            <div class="submit-box">
                <form id="submitForm">
                    <image id="preview" style="width: 100px;height: 100px;-o-object-fit: cover;">
                    <input type="text" id="file-content" placeholder="請輸入留言內容"><br>
                    <input type="file" id="file-uploader" accept="image/*"><br>
                    <input id="submitMessage" type="submit" value="送出">
                </form>
            </div>
            <hr>
        `;
    };
    
};

customElements.define("index-1", submit_box_HTML);