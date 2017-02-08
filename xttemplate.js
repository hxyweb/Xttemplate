class Xttemplate {
        constructor() {
            this.funText = []
        }
        transform(text) {
            return text.replace(/(["\\])/g,'\\$1');
        }
        funAddInit(obj) {
            let text = '';
            for(let key in obj) {
                let val =  obj[key];
                switch(typeof val) {
                    case 'object': val = JSON.stringify(obj[key]);break;
                    case 'function': val = val();break;
                    default: break;
                }
                text += `var ${key}=${val};`;
            }
            this.funText+=(text);
            this.funText+=(`var html = [];`)
        }
        funAddEnd() {
            this.funText+=(`;return html.join("");`);
        }
        funAddText(text) {
            text = this.transform(text);
            this.funText+=(`html.push("${text}");`)
        }
        funAddJsText(text) {
            let parrentStart = new RegExp('^\\s*(for|if)\\s*\\(.*?\\)\\s*$','i'),
                parrentEnd = new RegExp('^\\s*(endif|endfor)\\s*$','i'),
                parrentElse = new RegExp('^\\s*else\\s*$','i'),
                parrentElseif = new RegExp('^\\s*elseif\\s*\\((.*?)\\)\\s*$','i');

            switch(true) {
                case parrentStart.test(text) : text +='{'; break;
                case parrentEnd.test(text) : text ='}'; break;
                case parrentElse.test(text) : text = '}else{'; break;
                case parrentElseif.test(text) :  text = `}else if(${RegExp.$1}){`; break;
                default: text = `html.push(${text})`;
            }

            this.funText+=(text+';')
        }
        render (view,el) {
            el.innerHTML = view;
        }
        init({template, el}, obj) {
            let parrent = new RegExp('\\${\\s*([^{}]*)\\s*}','g'),
                ruleTag = new RegExp(''),
                result,
                index = 0;

            if(!template || !el) {
                console.error('Arguments was deficiency!');
                return;
            }
            const tmp = document.querySelector(template),
                ele = document.querySelector(el);
            
            if(!tmp || !ele){
                console.error('Template or container was not found!');
                return;
            }
            const html = tmp.innerHTML.replace(/[\r\t\n]/g,'');
            this.funAddInit(obj);

            while(result = parrent.exec(html)) {
               let beforeText = html.substr(index, result.index - index);
               this.funAddText(beforeText);
               this.funAddJsText(result[1]);
               index = (result[0].length + result.index);
            }
            this.funAddText(html.substr(index));
            this.funAddEnd();

            this.render(new Function(this.funText)(), ele);
        }
    }

    //  export default Xttemplate;