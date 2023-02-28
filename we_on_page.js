
async function init(){
    let styleElement = document.createElement("style");

    let cssRules = `
    .highlight_svgaefefef {
        position: fixed;
        z-index: 99999;
        user-select: none;
        pointer-events: none;
    }
    .picker_divsiuegfjnsuyrhv{
        position: fixed;
        z-index: 99999;
        bottom: 0px;
        right: 0px;
        width: 300px;
        height: 200px;
        background-color: white;
        box-shadow: black 9px 9px 20px 3px;
    }
    .buttons_div{
        position: absolute;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: row;
    }
    .buttons_div > button{
        width: 100px;
        height: 40px;
    }
    `


    let domain = window.location.hostname
    let domainRoute = domain + window.location.pathname
    /*  
    data = {
        when: "",
        selection: "",
        style: "display: none;"
    }
    */
    await chrome.storage.sync.get().then((result) => {
        let rules = result.rules || []
        rules.forEach((rule)=>{

            if (rule.when == domain || rule.when == domainRoute){
                console.log(rule)
                cssRules += `
                ${rule.selection}{
                    ${rule.style}
                }
                `
            }
        })
    })


    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);


    async function UpdateData(item){
        chrome.storage.sync.get().then((result) => {
            let rules = result.rules
            rules.push(item)
            console.log(rules)
            chrome.storage.sync.set({ "rules": rules })
        });
    }

    chrome.runtime.onMessage.addListener(
    function(request, sender) {
        let currentHighlights = [

        ]
        let current
        function HighlightSVG(elementArray) {
            currentHighlights.forEach((element) => {
                element.remove()
            })
            elementArray.forEach((element, i) => {
                let div  = document.createElement("div")
                currentHighlights.push(div)
                document.body.appendChild(div)
                div.innerHTML = `
                <svg id="svg${i}" style="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100% 100%" class="highlight_svgaefefef">
                <path id="margin${i}" d="" fill="rgba(230, 196, 153, 0.5)"/>
                <path id="border${i}" d="" fill="rgba(230, 230, 153, 0.5)"/>
                <path id="padding${i}" d="" fill="rgba(164, 230, 153, 0.5)"/>
                <path id="block${i}" d="" fill="rgba(153, 208, 230, 0.5)"/>
                </svg>`
            
                let highlight = {
                    svg: document.getElementById(`svg${i}`),
                    margin: document.getElementById(`margin${i}`),
                    border: document.getElementById(`border${i}`),
                    padding: document.getElementById(`padding${i}`),
                    block: document.getElementById(`block${i}`),
                }
        
                function get_pos(element){
                    let pos = element.getBoundingClientRect();
                    //let frame_pos = document.getElementsByClassName(styles.iframe)[0].getBoundingClientRect()
                    return {top: pos.top, left: pos.left, height: pos.height, width: pos.width}
                }
                function px_to_num(array){
                    array.forEach((v, i) => {
                        if (typeof(v) == "string") {
                            array[i] = Number(v.slice(0, -2))
                        }else{
                            array[i] = 0
                        }
                    })
                }
                let Elementpos = get_pos(element)
                let s = window.getComputedStyle(element, null)
                let Elpadding = [s["padding-bottom"], s["padding-left"], s["padding-right"], s["padding-top"]]
                let Elborder = [s["border-bottom"], s["border-left"], s["border-right"], s["border-top"]]
                Elborder.forEach((v, i) =>{
                    if (v.split(" ")[1] != "none"){
                        Elborder[i] = v.split(" ")[0]
                    }else{
                        Elborder[i] = 0
                    }
                })
                let Elmargin = [s["margin-bottom"], s["margin-left"], s["margin-right"], s["margin-top"]]
                px_to_num(Elpadding)
                px_to_num(Elborder)
                px_to_num(Elmargin)
        
        
                // Xpos, Ypos
                let p = [Elementpos.top, Elementpos.left]
                // Xsize, Ysize
                let b = [Elementpos.width, Elementpos.height]
                // bottom height, left width, right width, top height
                let pad = Elpadding
                let bor = Elborder
                let m = Elmargin
        
                // do this with path.....
                let pos = {
                    top: p[0],
                    left: p[1]
                }
                let block = {
                    width: b[0] - (pad[1] + pad[2]) - (bor[1] + bor[2]),
                    height: b[1] - (pad[0] + pad[3]) - (bor[0] + bor[3])
                }
                let padding = {
                    bottomH: pad[0],
                    leftW: pad[1],
                    rightW: pad[2],
                    topH: pad[3],
                    height: pad[0] + pad[3] + block.height,
                    width: pad[1] + pad[2] + block.width,
                }
                let border = {
                    bottomH: bor[0],
                    leftW: bor[1],
                    rightW: bor[2],
                    topH: bor[3],
                    height: bor[0] + bor[3] + padding.height,
                    width: bor[1] + bor[2] + padding.width,
                }
                let margin = {
                    bottomH: m[0],
                    leftW: m[1],
                    rightW: m[2],
                    topH: m[3],
                    height: m[0] + m[3] + border.height,
                    width: m[1] + m[2] + border.width,
                }
                let main_posTOP = pos.top - margin.topH
                let main_posLeft = pos.left - margin.leftW
                let main_width = margin.width
                let main_height = margin.height
                highlight.svg.style.top = main_posTOP
                highlight.svg.style.left = main_posLeft
                highlight.svg.style.width = main_width
                highlight.svg.style.height = main_height
            
            
                highlight.margin.setAttribute('d', `m 0 0 v ${margin.height} h ${margin.width} v ${-margin.height} h ${-margin.width} m ${margin.leftW} ${margin.topH} h ${border.width} v ${border.height} h ${-border.width} v ${-border.height}`)
                highlight.border.setAttribute('d', `m ${margin.leftW} ${margin.topH} v ${border.height} h ${border.width} v ${-border.height} h ${-border.width} m ${border.leftW} ${border.topH} h ${padding.width} v ${padding.height} h ${-padding.width} v ${-padding.height}`)
                highlight.padding.setAttribute('d',`m ${margin.leftW + border.leftW} ${margin.topH + border.topH} v ${padding.height} h ${padding.width} v ${-padding.height} h ${-padding.width} m ${padding.leftW} ${padding.topH} h ${block.width} v ${block.height} h ${-block.width} v ${-block.height}`)
                highlight.block.setAttribute('d', `m ${padding.leftW + border.leftW + margin.leftW} ${padding.topH + border.topH + margin.topH} v ${block.height} h ${block.width} v ${-block.height} h ${-block.width}`)    
            });
        }

        function mouseOver(ev){
            current = ev.target
            HighlightSVG([ev.target])
        }
        
        function mouseClick(){
            document.removeEventListener("mousedown", mouseClick)
            document.removeEventListener("mouseover", mouseOver)

            let div  = document.createElement("div")
            document.body.appendChild(div)
            div.classList.add(["picker_divsiuegfjnsuyrhv"])
            div.innerHTML = `
            <form>
            <label>depth:</label>
            <input id="slider" style="width: 100%;" type="range" min="0"><br>
    
            <input type="radio" id="domain" name="when">
            <label for="domain">this domain</label><br>
            <input checked type="radio" id="domain/route" name="when">
            <label for="domain/route">this domain/route</label><br>
        </form>
    
    
        <div class="buttons_div">
        <button id="Delete">Delete</button>
        <button id="Pick again">Pick again</button>
        <button id="Cancel">Cancel</button>
        </div>
    
            `
            let slider = document.getElementById("slider")
            let depth = [

            ]
            function CreateDepth(){
                depth.push(current)

                function addChild(child){
                    if (child.childElementCount == 1){
                        let c = child.childNodes[0]
                        depth.push(c)
                        addChild(c)
                    }
                }
                addChild(current)

                function addParent(Parent){
                    if (Parent.parentElement){
                        let c = Parent.parentElement
                        depth.unshift(c)
                        addParent(c)
                    }
                }

                addParent(current)
            }
            CreateDepth()

            slider.setAttribute("max", depth.length - 1)
            slider.setAttribute("value", depth.indexOf(current))

            function ValueChange(ev){
                current = depth[slider.value]
                HighlightSVG([current])
            }

            slider.addEventListener("input", ValueChange)

            let buttons = {
                delete: document.getElementById("Delete"),
                pickAgain: document.getElementById("Pick again"),
                cancel: document.getElementById("Cancel"),
            }

            buttons.pickAgain.addEventListener("click", ()=>{
                div.remove()
                current = undefined
                HighlightSVG([])

                document.addEventListener("mouseover", mouseOver)
                document.addEventListener("mousedown", mouseClick)
            })
            buttons.cancel.addEventListener("click", ()=>{
                div.remove()
                current = undefined
                HighlightSVG([])
            })

            buttons.delete.addEventListener("click", ()=>{
                let data = {
                    when: "",
                    selection: "",
                    style: "display: none;"
                }

                // save a rule to display: none this element
                let when = document.querySelector('input[name="when"]:checked').id
                if (when === "domain"){
                    data.when = window.location.hostname
                }else if(when === "domain/route"){
                    data.when = window.location.hostname + window.location.pathname
                }

                let selectionStr = ""
                let cSelector = ""
                function PreciseSelection(el){
                    let sessionStr= ""
                    let id = el.getAttribute("id")
                    let pastQueryCount = Infinity
                    if (id){
                        let eWithID = document.querySelectorAll("#" + id + sessionStr)
                        if (eWithID.length == 1){
                            sessionStr = "#" + id
                            selectionStr = sessionStr +  cSelector + selectionStr
                            return    
                        }else if(eWithID.length < pastQueryCount){
                            sessionStr = "#" + id
                        }
                        pastQueryCount = eWithID.length
                    }
                    if(el.classList.length > 0){
                        let classes = ""
                        el.classList.forEach((c) =>{
                            classes += "." + String(c).replace("\\", "\\\\").replace(":", "\\:")
                        })
                        let eWithClass = document.querySelectorAll(sessionStr + classes)
                        if (eWithClass.length == 1){
                            sessionStr = sessionStr + classes
                            selectionStr = sessionStr + cSelector +  selectionStr
                            return
                        }else if(eWithClass.length < pastQueryCount){
                            sessionStr = sessionStr + classes
                        }
                        pastQueryCount = eWithClass.length
                    }
                    let tagName = el.tagName.toLowerCase()
                    if(tagName){
                        let eWithTag = document.querySelectorAll(tagName + sessionStr)
                        if (eWithTag.length == 1){
                            sessionStr = tagName + sessionStr
                            selectionStr = sessionStr + cSelector +  selectionStr
                            return
                        }else if(eWithTag.length < pastQueryCount){
                            sessionStr = tagName + sessionStr
                        }
                        pastQueryCount = eWithTag.length
                    }

                    //pseudo-classes now
                    //":empty", ":only-child", ":only-of-type", ":first-child", ":last-child", ":first-of-type", ":last-of-type"
                    let pseudo = []

                    for (let index = 0; index < pseudo.length; index++) {
                        const p = pseudo[index];
                        let eWithPseudo = document.querySelectorAll(sessionStr + p)
                        let isCur = false
                        eWithPseudo.forEach((withPseudo)=>{
                            if (withPseudo === el) {isCur = true}
                        })
                        if (!isCur) {continue}
                        if (eWithPseudo.length == 1){
                            sessionStr = sessionStr + p
                            selectionStr = sessionStr + cSelector +  selectionStr
                            return
                        }else if(eWithPseudo.length < pastQueryCount){
                            sessionStr = sessionStr + p
                        }
                        pastQueryCount = eWithPseudo.length
                    }

                    let pseudoIterable = [":nth-of-type", ":nth-child"]

                    for (let index = 0; index < pseudoIterable.length; index++) {
                        const p = pseudoIterable[index]

                        let siblings = Array.from(el.parentNode.children)

                        if (p == ":nth-of-type" ){
                            let sessionElements = Array.from(document.querySelectorAll(sessionStr))
                            siblings = siblings.filter(node=> 
                                sessionElements.includes(node)
                            )
                        }

                        let ind = siblings.indexOf(el);
                        
                        let eWithPseudo = document.querySelectorAll(sessionStr + p + `(${ind + 1})`)
                        if (eWithPseudo.length == 1){
                            sessionStr = sessionStr + p + `(${ind + 1})`
                            selectionStr = sessionStr + cSelector + selectionStr
                            return
                        }else if(eWithPseudo.length < pastQueryCount){
                            sessionStr = sessionStr + p + `(${ind + 1})`
                        }
                        pastQueryCount = eWithPseudo.length
                    }

                    if (sessionStr){
                        if(selectionStr){
                            selectionStr = sessionStr + " > " + selectionStr
                        }else{
                            selectionStr = sessionStr
                        }
                    }

                    if(el.parentElement){
                        cSelector = " > "
                        PreciseSelection(el.parentElement)
                    }
                }
                PreciseSelection(current)
                data.selection = selectionStr
                console.log(selectionStr)

                UpdateData(data)

                div.remove()
                current = undefined
                HighlightSVG([])
            })
        }
        document.addEventListener("mouseover", mouseOver)
        document.addEventListener("mousedown", mouseClick)
    });
}
init()
