const STATES = [
  ["01","Jammu and Kashmir"],["02","Himachal Pradesh"],["03","Punjab"],["04","Chandigarh"],
  ["05","Uttarakhand"],["06","Haryana"],["07","Delhi"],["08","Rajasthan"],["09","Uttar Pradesh"],
  ["10","Bihar"],["11","Sikkim"],["12","Arunachal Pradesh"],["13","Nagaland"],["14","Manipur"],
  ["15","Mizoram"],["16","Tripura"],["17","Meghalaya"],["18","Assam"],["19","West Bengal"],
  ["20","Jharkhand"],["21","Odisha"],["22","Chhattisgarh"],["23","Madhya Pradesh"],["24","Gujarat"],
  ["25","Daman and Diu"],["26","Dadra and Nagar Haveli and Daman and Diu"],["27","Maharashtra"],
  ["28","Andhra Pradesh"],["29","Karnataka"],["30","Goa"],["31","Lakshadweep"],["32","Kerala"],
  ["33","Tamil Nadu"],["34","Puducherry"],["35","Andaman and Nicobar Islands"],["36","Telangana"],
  ["37","Andhra Pradesh"],["38","Ladakh"]
];
const GST_RATES=[0,5,12,18,28];
const $=id=>document.getElementById(id);
let qrDataUrl="";
let items=[
  {name:"LED Bulb 20W",hsn:"85395000",qty:50,uom:"Nos",rate:150,gst:18},
  {name:"LED Tube Light",hsn:"94054090",qty:20,uom:"Nos",rate:300,gst:18},
  {name:"Wire 1.5mm",hsn:"85444900",qty:10,uom:"Roll",rate:900,gst:18}
];

function money(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2}).format(Number(n)||0)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function stateLabel(code){const s=STATES.find(x=>x[0]===code);return s?`${s[1]} (${s[0]})`:""}
function gstinLooksValid(v){return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(String(v).trim())}
function getCode(select){return select.value}
function localDate(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10)}
function invoiceNumber(){let n=Number(localStorage.getItem("smartGstInvoiceCounter")||"1000")+1;localStorage.setItem("smartGstInvoiceCounter",n);return `INV-${String(n).padStart(6,"0")}`}
function initStates(){
  ["sellerState","buyerState","placeOfSupply"].forEach(id=>{
    const el=$(id);el.innerHTML=STATES.map(([c,n])=>`<option value="${c}">${esc(n)} (${c})</option>`).join("");
  });
  $("sellerState").value="03";$("buyerState").value="03";$("placeOfSupply").value="03";
}
function initDefaults(){
  $("invoiceNo").value=invoiceNumber();
  $("invoiceDate").value=localDate();
  $("dueDate").value=localDate();
  renderItems();
  bind();
  update();
}
function renderItems(){
  $("items").innerHTML=items.map((it,i)=>`
    <div class="item-row" data-index="${i}">
      <span class="item-no">${i+1}</span>
      <input data-k="name" value="${esc(it.name)}" placeholder="Product / Service">
      <input data-k="hsn" value="${esc(it.hsn)}" placeholder="HSN/SAC">
      <input data-k="qty" type="number" min="0" step="0.001" value="${it.qty}">
      <input data-k="uom" value="${esc(it.uom)}" placeholder="Nos">
      <input data-k="rate" type="number" min="0" step="0.01" value="${it.rate}">
      <select data-k="gst">${GST_RATES.map(r=>`<option value="${r}" ${Number(it.gst)===r?"selected":""}>${r}%</option>`).join("")}</select>
      <span class="line-amount">${money(Number(it.qty)*Number(it.rate))}</span>
      <button class="remove-item" title="Remove">×</button>
    </div>`).join("");
  document.querySelectorAll(".item-row input,.item-row select").forEach(el=>el.addEventListener("input",e=>{
    const row=e.target.closest(".item-row"),i=Number(row.dataset.index),k=e.target.dataset.k;
    items[i][k]=e.target.value;
    update();
  }));
  document.querySelectorAll(".remove-item").forEach(b=>b.addEventListener("click",e=>{
    const i=Number(e.target.closest(".item-row").dataset.index);
    if(items.length===1){showToast("At least one item row is kept.");return}
    items.splice(i,1);renderItems();update();
  }));
}
function totals(){
  let taxable=0, tax=0;
  items.forEach(it=>{
    const base=Math.max(0,Number(it.qty)||0)*Math.max(0,Number(it.rate)||0);
    taxable+=base;tax+=base*(Number(it.gst)||0)/100;
  });
  const intra=getCode($("sellerState"))===getCode($("placeOfSupply"));
  return {taxable,tax,intra,grand:taxable+tax};
}
function update(){
  const t=totals(), same=t.intra;
  $("taxableTotal").textContent=money(t.taxable);$("taxTotal").textContent=money(t.tax);$("grandTotal").textContent=money(t.grand);
  $("taxLabel").textContent=same?"CGST + SGST":"IGST";
  document.querySelectorAll(".line-amount").forEach((el,i)=>el.textContent=money((Number(items[i]?.qty)||0)*(Number(items[i]?.rate)||0)));
  $("pInvoiceNo").textContent=$("invoiceNo").value;
  $("pInvoiceDate").textContent=formatDate($("invoiceDate").value);
  $("pPlace").textContent=stateLabel($("placeOfSupply").value);
  $("pPayment").textContent=$("paymentTerms").value;
  $("pSellerName").textContent=$("sellerName").value||"Your Firm Name";
  $("pSellerAddress").textContent=$("sellerAddress").value||"";
  $("pSellerGstin").textContent=$("sellerGstin").value||"—";
  $("pBuyerName").textContent=$("buyerName").value||"Customer";
  $("pBuyerName2").textContent=$("buyerName").value||"Customer";
  $("pBuyerAddress").textContent=$("buyerAddress").value||"";
  $("pBuyerAddress2").textContent=$("buyerAddress").value||"";
  $("pBuyerGstin").textContent=$("buyerGstin").value||"—";
  $("pBuyerState").textContent=stateLabel($("buyerState").value);
  $("pTaxable").textContent=money(t.taxable);$("pTax").textContent=money(t.tax);
  $("pTaxName").textContent=same?"CGST + SGST":"IGST";
  $("pGrand").textContent=money(t.grand);
  $("pWords").textContent=amountInWords(t.grand);
  $("pBank").textContent=$("bankName").value||"";
  $("pAccount").textContent=$("accountNo").value?`A/c No.: ${$("accountNo").value}`:"";
  $("pIfsc").textContent=$("ifsc").value?`IFSC: ${$("ifsc").value}`:"";
  $("pTerms").textContent=$("terms").value||"";
  $("pFirmBottom").textContent=$("sellerName").value||"Your Firm Name";
  $("pUpi").textContent=$("upiId").value?`UPI: ${$("upiId").value}`:"";
  $("pQr").src=qrDataUrl;
  $("pQr").classList.toggle("hidden",!qrDataUrl);
  renderPreviewItems();
  checkGST();
}
function renderPreviewItems(){
  $("pItems").innerHTML=items.map((it,i)=>{
    const amount=(Number(it.qty)||0)*(Number(it.rate)||0);
    return `<tr><td>${i+1}</td><td>${esc(it.name)||"—"}</td><td>${esc(it.hsn)||"—"}</td><td>${esc(it.qty)}</td><td>${esc(it.uom)}</td><td>${money(it.rate).replace("₹","")}</td><td>${Number(it.gst)||0}%</td><td>${money(amount).replace("₹","")}</td></tr>`
  }).join("");
}
function formatDate(v){if(!v)return"—";const d=new Date(v+"T00:00:00");return d.toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"})}
function checkGST(){
  const problems=[];
  if(!$("sellerName").value.trim())problems.push("Seller name missing");
  if(!gstinLooksValid($("sellerGstin").value))problems.push("Seller GSTIN format needs review");
  if($("buyerGstin").value.trim() && !gstinLooksValid($("buyerGstin").value))problems.push("Buyer GSTIN format needs review");
  if(!$("placeOfSupply").value)problems.push("Place of supply missing");
  items.forEach((it,i)=>{if(!String(it.name).trim())problems.push(`Item ${i+1} name missing`);if(!String(it.hsn).trim())problems.push(`Item ${i+1} HSN/SAC missing`);});
  const box=$("gstGuard"),text=$("guardText");
  if(problems.length){box.className="guard warn";text.textContent=problems.slice(0,2).join(" • ")+(problems.length>2?` • +${problems.length-2} more`:"");}
  else {box.className="guard good";text.textContent="Basic invoice checks passed. Review details before issuing."}
}
function amountInWords(n){
  n=Math.round(Number(n)||0); if(n===0)return"Zero Rupees Only";
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const two=x=>x<20?ones[x]:tens[Math.floor(x/10)]+(x%10?" "+ones[x%10]:"");
  const three=x=>x<100?two(x):ones[Math.floor(x/100)]+" Hundred"+(x%100?" "+two(x%100):"");
  let out="";
  if(n>=10000000){out+=three(Math.floor(n/10000000))+" Crore ";n%=10000000}
  if(n>=100000){out+=two(Math.floor(n/100000))+" Lakh ";n%=100000}
  if(n>=1000){out+=two(Math.floor(n/1000))+" Thousand ";n%=1000}
  if(n>0)out+=three(n);
  return out.trim()+" Rupees Only";
}
function showToast(msg){const t=$("toast");t.textContent=msg;t.classList.remove("hidden");clearTimeout(showToast.t);showToast.t=setTimeout(()=>t.classList.add("hidden"),2600)}
function saveDraft(){
  const data={items,qrDataUrl,fields:{}};
  document.querySelectorAll("input,select,textarea").forEach(el=>{if(el.id&&el.id!=="qrInput")data.fields[el.id]=el.value});
  localStorage.setItem("smartGstDraft",JSON.stringify(data));showToast("Draft saved in this browser.");
}
function loadDraft(){
  try{
    const raw=localStorage.getItem("smartGstDraft");if(!raw)return;
    const d=JSON.parse(raw);items=Array.isArray(d.items)&&d.items.length?d.items:items;qrDataUrl=d.qrDataUrl||"";
    Object.entries(d.fields||{}).forEach(([id,v])=>{if($(id))$(id).value=v});
  }catch(e){console.warn(e)}
}
async function downloadPDF(){
  if(!window.html2pdf){showToast("PDF library is not loaded. Check your internet connection.");return}
  checkGST();
  const el=$("invoicePreview");
  const opt={margin:0.2,filename:`${$("invoiceNo").value||"GST-Invoice"}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:true,backgroundColor:"#ffffff"},jsPDF:{unit:"in",format:"a4",orientation:"portrait"}};
  showToast("Preparing PDF…");
  await window.html2pdf().set(opt).from(el).save();
}
function printInvoice(){
  const html=$("invoicePreview").outerHTML;
  const w=window.open("","_blank","width=900,height=900");
  if(!w){showToast("Allow pop-ups to print the invoice.");return}
  w.document.write(`<html><head><title>${esc($("invoiceNo").value)}</title><link rel="stylesheet" href="styles.css"><style>body{background:white}.invoice-paper{box-shadow:none;border:0;margin:0 auto;max-width:800px}@page{size:A4;margin:8mm}.preview-actions,.preview-toolbar{display:none!important}</style></head><body>${html}</body></html>`);
  w.document.close();w.focus();setTimeout(()=>w.print(),400);
}
function bind(){
  document.querySelectorAll("input:not(#qrInput),select,textarea").forEach(el=>el.addEventListener("input",update));
  document.querySelectorAll("select").forEach(el=>el.addEventListener("change",update));
  $("addItemBtn").onclick=()=>{items.push({name:"",hsn:"",qty:1,uom:"Nos",rate:0,gst:18});renderItems();update()};
  $("sampleBtn").onclick=()=>{items=[{name:"LED Bulb 20W",hsn:"85395000",qty:50,uom:"Nos",rate:150,gst:18},{name:"LED Tube Light",hsn:"94054090",qty:20,uom:"Nos",rate:300,gst:18},{name:"Wire 1.5mm",hsn:"85444900",qty:10,uom:"Roll",rate:900,gst:18}];renderItems();update();showToast("Sample items loaded.")};
  $("checkBtn").onclick=()=>{checkGST();showToast("GST Guard checked.")};
  $("saveDraftBtn").onclick=saveDraft;
  $("downloadBtn").onclick=downloadPDF;$("downloadTopBtn").onclick=downloadPDF;
  $("printBtn").onclick=printInvoice;
  $("whatsappBtn").onclick=()=>{const msg=`Invoice ${$("invoiceNo").value} — ${money(totals().grand)}. Please find the invoice attached.`;window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank")};
  $("emailBtn").onclick=()=>{window.location.href=`mailto:?subject=${encodeURIComponent("GST Invoice "+$("invoiceNo").value)}&body=${encodeURIComponent("Invoice "+$("invoiceNo").value+" for "+money(totals().grand))}`};
  $("qrInput").onchange=e=>{
    const file=e.target.files?.[0];if(!file)return;
    if(file.size>5*1024*1024){showToast("Please choose a QR image under 5 MB.");return}
    const r=new FileReader();r.onload=()=>{qrDataUrl=r.result;$("qrThumb").src=qrDataUrl;$("qrThumb").classList.remove("hidden");$("qrPlaceholder").classList.add("hidden");$("removeQrBtn").classList.remove("hidden");update()};r.readAsDataURL(file);
  };
  $("removeQrBtn").onclick=()=>{qrDataUrl="";$("qrInput").value="";$("qrThumb").classList.add("hidden");$("qrPlaceholder").classList.remove("hidden");$("removeQrBtn").classList.add("hidden");update()};
  $("newInvoiceNav").onclick=()=>location.reload();
  $("themeBtn").onclick=()=>document.body.classList.toggle("dark-lite");
  $("helpBtn").onclick=()=>showToast("Create → review GST Guard → preview → download.");
  $("loginBtn").onclick=()=>showToast("Login will be added later when cloud features are ready.");
  document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("globalSearch").focus()}});
}
initStates();
loadDraft();
initDefaults();
