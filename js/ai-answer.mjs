import {sources} from './light-data.mjs?v=4.7.2';
const referencePattern=new RegExp('\\[(?:'+sources.map(s=>s.id).join('|')+'|userpolicy|[0-9]{1,3})\\]','g');

// Model text is untrusted. Build text nodes only; never parse it as HTML.
export function aiAnswerBlocks(answer) {
  const text=answer.replace(/\r\n?/g,'\n')
    .replace(/<\/?p(?:\s[^>]*)?>|<br\s*\/?>/gi,'\n')
    .replace(/<\/?[a-z][^>]*>/gi,'')
    .replace(/^```[^\n]*$/gm,'')
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g,'$1')
    .replace(referencePattern,'').replace(/[ \t]+([，。；：！？、])/g,'$1')
    .replace(/\*\*|__/g,'').replace(/`/g,'')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[，。,.!?])/g,'$1$2')
    .replace(/^\s{0,3}#{1,6}\s+/gm,'');
  const blocks=[];let paragraph=[];
  const flush=()=>{if(paragraph.length){blocks.push({type:'paragraph',text:paragraph.join(' ')});paragraph=[];}};
  for(const raw of text.split('\n')){
    const line=raw.trim();if(!line){flush();continue;}
    const item=line.match(/^(?:([-*•])\s+|([0-9]+)[.)、]\s*)(.+)$/);
    if(item){flush();const ordered=Boolean(item[2]),last=blocks.at(-1);if(last?.type==='list'&&last.ordered===ordered)last.items.push(item[3]);else blocks.push({type:'list',ordered,items:[item[3]]});}
    else paragraph.push(line);
  }
  flush();return blocks;
}
export function renderAiAnswer(container,answer) {
  container.replaceChildren();
  for(const block of aiAnswerBlocks(answer)){
    if(block.type==='paragraph'){const p=document.createElement('p');p.textContent=block.text;container.append(p);}
    else{const list=document.createElement(block.ordered?'ol':'ul');for(const text of block.items){const li=document.createElement('li');li.textContent=text;list.append(li);}container.append(list);}
  }
}
