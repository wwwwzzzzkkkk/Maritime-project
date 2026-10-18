import test from 'node:test';
import assert from 'node:assert/strict';
import {aiAnswerBlocks} from '../js/ai-answer.mjs';
test('AI display turns common Markdown/HTML wrappers into paragraphs and real step lists',()=>{
 const blocks=aiAnswerBlocks('## **操作步骤**\n\n<p>先打开 **方案比较**。[pool]</p>\n\n1. 设置数量\n2. 查看分配\n\n- __只是模拟__\n- 不提交申请');
 assert.deepEqual(blocks,[{type:'paragraph',text:'操作步骤'},{type:'paragraph',text:'先打开 方案比较。'},{type:'list',ordered:true,items:['设置数量','查看分配']},{type:'list',ordered:false,items:['只是模拟','不提交申请']}]);
});
test('formatting preserves monetary signs, units and legitimate comparison symbols',()=>{
 const blocks=aiAnswerBlocks('费用变化 −€12,000 / -€25.50；UK £13,200。[eu][uk]\n能源 164,000,000 MJ，强度 < 91.16 gCO₂e/MJ，6% ≠ 2%。请核验 [pool]。');
 const text=blocks.map(b=>b.text).join(' ');
 assert.ok(text.includes('−€12,000'));assert.ok(text.includes('-€25.50'));assert.ok(text.includes('£13,200'));assert.ok(text.includes('< 91.16'));assert.ok(text.includes('164,000,000 MJ'));assert.equal(text.includes('[eu]'),false);assert.ok(text.includes('请核验。'));
});
test('untrusted model HTML becomes text content, while official reference markers stay out of answer copy',()=>{
 const blocks=aiAnswerBlocks('<p>预算<br>请核对[1][fuel]</p><img src=x onerror=alert(1)>\n[官方资料](https://example.invalid)');
 assert.deepEqual(blocks,[{type:'paragraph',text:'预算 请核对'},{type:'paragraph',text:'官方资料'}]);
 assert.equal(JSON.stringify(blocks).includes('onerror'),false);
});
