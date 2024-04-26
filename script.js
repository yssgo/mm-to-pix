let jqr = jQuery.noConflict();

let selector = (x) => document.querySelector(x);
let selectorAll = (x) => document.querySelectorAll(x);
let getValue = (x) => selector(x).value;
let valueToFloat = (x) => parseFloat(getValue(x));
let valueToInt = (x) => parseInt(getValue(x));

function constrain(){  
    let elemPrc = jqr('#precision');    
    let prc = parseInt(elemPrc.val());    
    let pmin = parseInt(elemPrc.attr("min"));
    let pmax = parseInt(elemPrc.attr("max"));    
    if (prc < pmin) {
        elemPrc.val(pmin);   
    }
    else if (prc > pmax) {
        elemPrc.val(pmax);
    }    
}
function convert_from(src_unit, before, dpi){
    let dest_unit = jqr("#convert_unit_select > option:checked").val();
    return {
      mm: {
        mm: before, 
        cm: before/10.0,
        "in": before/25.4,
        px: before/25.4*dpi
      },
      cm: {
        mm: before*10.0,
        cm: before,
        "in": before/2.54,
        px: before/2.54*dpi  
      },
      "in": {
        mm : before*25.4,
        "cm": before*2.54,
        "in": before,
        "px": before*dpi
      },
      px: {
        "mm": before/dpi*25.4,
        "cm": before/dpi*2.54,
        "in": before/dpi,
        "px": before
      }
    }[src_unit][dest_unit];
}    
function convert(){
    "use strict";
    let cm=0;
    let inch=0;
    let mm=0;
    let beforeX, beforeY=0;
    let afterX, afterY=0;
    let precision = valueToFloat('#precision');
    let src_unit = jqr('#unit_select > option:checked').val();
    let dest_unit = jqr("#convert_unit_select > option:checked").val();
    let dpi;
    beforeX = valueToFloat('#nbUnitsX');    
    beforeY = valueToFloat('#nbUnitsY');
    if (isNaN(beforeX)){
        beforeX=0;
    }
    if (isNaN(beforeY)){
        beforeY=0;
    }        
    if(jqr('input[name=choice_method]:checked').val()== "선택"){
        dpi = valueToFloat('input[name=dpi_radio]:checked');
    }else{
        dpi = valueToFloat('#dpi_text');
        if(isNaN(dpi)){
            dpi=0;
        }
    }
    afterX = convert_from(src_unit, beforeX, dpi);
    afterY = convert_from(src_unit, beforeY, dpi);    
    let elemConvertedX = selector('#nbUnitsConvertedX')
    let elemConvertedY = selector('#nbUnitsConvertedY')
    let elemRoundPixel = selector('#roundpixel');
    if(dest_unit=="px" && elemRoundPixel.checked==true){
        elemConvertedX.value = Math.floor(afterX+0.5);
        elemConvertedY.value = Math.floor(afterY+0.5);
    }else{
        elemConvertedX.value = afterX.toFixed(precision);
        elemConvertedY.value = afterY.toFixed(precision);
    }
    let url = new URL(window.location.href);
    let page_address = url.origin + url.pathname;
    url = new URL(page_address);
    url.searchParams.append('dpi', dpi);
    url.searchParams.append('w',beforeX);
    url.searchParams.append('h',beforeY);
    url.searchParams.append('from', src_unit);
    url.searchParams.append('to', dest_unit);
    url.searchParams.append('prec', precision);
    url.searchParams.append('roundpixel', elemRoundPixel.checked);
    //jqr('#params').text(url.searchParams.toString());
    
    jqr('#full_url').prop("value", page_address+"?"+ url.searchParams.toString() );
    //jqr('#simple_url').prop("value", page_address);
}
function dpi_radio_changed(){
    let dpi = valueToFloat('input[type=radio][name=dpi_radio]:checked');
    selector('#dpi_text').value = parseInt(dpi);
}
function methodchanged(){
    if(getValue('input[type=radio][name=choice_method]:checked') == "선택"){
        selector('#dpi_text').readOnly = true;
        selector('#dpi_text').className = 'disabled'
        selectorAll('input[name=dpi_radio]').forEach(function(item, index, array){
            item.disabled = false;
            item.className = 'ensabled';
        })        
        selector('#fsDPI').className = 'enabled';
    }
    else{
        selector('#dpi_text').readOnly = false;
        selector('#dpi_text').className = 'enabled';
        selectorAll('input[name=dpi_radio]').forEach(function(item, index, array){
            item.disabled = true;
            item.className = 'disabled';
        })
        selector('#fsDPI').className = 'disabled';
    }
}
/*
Provide some of these parameters:

    https://mm-to-px.usgnosny.repl.co?dpi=300&w=170&h=250&from=mm&to=px&prec=3&roundpixel=true

Or provide none of them.

    https://mm-to-px.usgnosny.repl.co

*/
window.onload = function(){
    let url_string = window.location.href;
    let url = new URL(url_string);
    
    let dpi=url.searchParams.get("dpi");
    
    if(dpi!==null){
        jqr("input[name=choice_method]").val(["직접 입력"]);
        dpi_radio_changed();
        jqr("#dpi_text").val(dpi);
    }
    let w=url.searchParams.get("w");
    if(w!=null){
        jqr("#nbUnitsX").val(w);
    }
    let h=url.searchParams.get("h");
    if(h!=null){
        jqr("#nbUnitsY").val(h);
    }
    let from_ = url.searchParams.get("from");
    if(from_ != null) {
        jqr("#unit_select").val(from_).change();
    }    
    let to_ = url.searchParams.get("to");
    if (to_ != null){
        jqr("#convert_unit_select").val(to_).change();
    }
    let prec = url.searchParams.get("prec");
    if(prec != null) {
        jqr("#precison").val(prec).change();
    }    
    let roundpixel = url.searchParams.get("#roundpixel");
    if(roundpixel != null){
        jqr("#roundpixel").prop('checked',true) 
    }
    convert();
    let page_address = url.origin + url.pathname;
    //jqr('#usage span[name="page_address"]').each(function(){jqr(this).text(page_address);});    
    jqr('#simple_url').prop("value", page_address);
}
