const fs = require('node:fs');
const data = fs.readFileSync('Lato-Regular.json', 'utf8');
const font = JSON.parse(data);

console.log(`font->name = ustring_STR("${font.info.face}");`);
console.log(`font->line_height = ${font.common.lineHeight};`);
console.log(`font->size = ${font.info.size};`);
console.log(`font->texture_width = ${font.common.scaleW};`);
console.log(`font->texture_height = ${font.common.scaleH};`);

console.log(`int char_data[][9] = {`);
for (const char of font.chars) {
    // int id, index, xoffset, yoffset, xadvance, width, height;
    //console.log(`hmput(font->char_map, ${char.id}, (msdf_glyph){.id = ${char.id}, .index = ${char.index}, .xoffset = ${char.xoffset}, .yoffset = ${char.yoffset}, .xadvance = ${char.xadvance}, .width = ${char.width}, .height = ${char.height}, .x = ${char.x}, .y = ${char.y}});`)
    console.log(`${char.id}, ${char.index}, ${char.xoffset}, ${char.yoffset}, ${char.xadvance}, ${char.width}, ${char.height}, ${char.x}, ${char.y},`);
}
console.log(`};`);

console.log(`int kerning_data[][3] = {`);
for (const kerning of font.kernings) {
    //console.log(`hmput(font->kerning_map, (kerning_key){.first = ${kerning.first}, .second = ${kerning.second}}, ${kerning.amount});`);
    console.log(`${kerning.first}, ${kerning.second}, ${kerning.amount},`);
}
console.log(`};`);
