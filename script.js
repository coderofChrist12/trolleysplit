var currentUser = localStorage.getItem("ts_currentUser") || "user";

var items = JSON.parse(localStorage.getItem("ts_items") || "[]"); 
var members = JSON.parse(localStorage.getItem("ts_members") || "[]"); 
var splitMode = localStorage.getItem("ts_splitMode") || "even"; 
var totalBudget = Number(localStorage.getItem("ts_budget") || 0);
var notesText = localStorage.getItem("ts_notes") || "";


document.addEventListener("DOMContentLoaded", function () {
document.getElementById("splitEven").checked = (splitMode === "even");
document.getElementById("splitCustom").checked = (splitMode === "custom");
toggleCustomAmountInput();
document.getElementById("notes").value = notesText;

renderMembers();
renderItems();
renderOverview();

document.getElementById("splitEven").addEventListener("change", onSplitModeChange);
document.getElementById("splitCustom").addEventListener("change", onSplitModeChange);
});


function saveAll() {
localStorage.setItem("ts_items", JSON.stringify(items));
localStorage.setItem("ts_members", JSON.stringify(members));
localStorage.setItem("ts_splitMode", splitMode);
localStorage.setItem("ts_budget", String(totalBudget));
localStorage.setItem("ts_notes", notesText);
}

function toast(msg) {
var t = document.getElementById("toast");
t.textContent = msg;
t.className = "show";
setTimeout(() => t.className = t.className.replace("show",""), 2200);
}


function onSplitModeChange() {
splitMode = document.getElementById("splitCustom").checked ? "custom" : "even";
toggleCustomAmountInput();
if(splitMode==="even") members.forEach(m => m.amount = null);
saveAll(); renderMembers(); renderOverview();
}

function toggleCustomAmountInput() {
var disabled = document.getElementById("splitEven").checked === true;
document.getElementById("memberAmount").disabled = disabled;
document.getElementById("memberAmount").value = "";
}


function addMember() {
var name = document.getElementById("memberName").value.trim();
var amountInput = document.getElementById("memberAmount").value;
var amount = amountInput ? Number(amountInput) : null;

if(!name){ toast("Enter member name"); return; }
if(splitMode==="custom" && (amount===null||isNaN(amount)||amount<=0)){ toast("Enter a valid custom amount"); return; }

if(members.some(m => m.name.toLowerCase()===name.toLowerCase())){ toast("Member exists"); return; }

members.push({ name: name, amount: (splitMode==="custom"?amount:null) });
document.getElementById("memberName").value=""; document.getElementById("memberAmount").value="";
saveAll(); renderMembers(); renderOverview(); toast("Member added");
}

function removeMember(idx){
 members.splice(idx,1); saveAll(); renderMembers(); renderOverview(); toast("Member removed");
}

function renderMembers(){
 var ul = document.getElementById("memberList"); ul.innerHTML="";
 members.forEach((m,i)=>{
 var li=document.createElement("li"); 
 var label=m.name; 
 if(splitMode==="custom"&&m.amount!==null) label+=" — R"+m.amount.toFixed(2);
 li.textContent=label;

 var btn=document.createElement("button");
 btn.textContent="Remove"; btn.className="btn-danger small"; btn.onclick=()=>removeMember(i);
 li.appendChild(btn); ul.appendChild(li);
 });
 document.getElementById("peopleCount").textContent=" People: "+members.length;
}


function addItem() {
 var name=document.getElementById("itemName").value.trim();
 var qty=Number(document.getElementById("itemQty").value);
 var price=Number(document.getElementById("itemPrice").value);
 var cat=document.getElementById("itemCategory").value;

 if(!name || isNaN(qty)||qty<=0||isNaN(price)||price<=0){ toast("Fill item name, qty and price"); return; }

 var total = qty*price;
 items.push({ name, qty, price, category: cat||"", total, addedBy: currentUser });

 document.getElementById("itemName").value=""; document.getElementById("itemQty").value=""; document.getElementById("itemPrice").value=""; document.getElementById("itemCategory").value="";
 saveAll(); renderItems(); renderOverview(); toast("Item added");
}

function deleteItem(idx){ items.splice(idx,1); saveAll(); renderItems(); renderOverview(); toast("Item removed"); }

function editItem(idx){
 var it=items[idx];
 var n=prompt("Item name:",it.name); if(!n||n.trim()==="") return;
 var q=Number(prompt("Quantity:",it.qty)); if(isNaN(q)||q<=0) return;
 var p=Number(prompt("Price per unit:",it.price)); if(isNaN(p)||p<=0) return;
 var c=prompt("Category (optional):",it.category||"");
 items[idx]={ name:n.trim(), qty:q, price:p, category:c||"", total:q*p, addedBy:it.addedBy };
 saveAll(); renderItems(); renderOverview(); toast("Item updated");
}

function renderItems(){
 var ul=document.getElementById("groceryList"); ul.innerHTML="";
 var showMine=document.getElementById("filterMyItems").checked;

 items.forEach((it,i)=>{
 if(showMine && it.addedBy!==currentUser) return;

 var li=document.createElement("li");
 var text=it.qty+" × "+it.name+" @ R"+it.price.toFixed(2)+" = R"+it.total.toFixed(2);
 if(it.category) text+=" — "+it.category;
 li.textContent=text;

 var editBtn=document.createElement("button"); editBtn.textContent="Edit"; editBtn.className="small"; editBtn.onclick=()=>editItem(i);
 var delBtn=document.createElement("button"); delBtn.textContent="Remove"; delBtn.className="btn-danger small"; delBtn.onclick=()=>deleteItem(i);

 // store search buttons
 var shopBtn=document.createElement("button"); shopBtn.textContent="ShopRite"; shopBtn.className="small"; shopBtn.onclick=()=>window.open(`https://www.shoprite.co.za/search?text=${encodeURIComponent(it.name)}`,'_blank');
 var pickBtn=document.createElement("button"); pickBtn.textContent="Pick n Pay"; pickBtn.className="small"; pickBtn.onclick=()=>window.open(`https://www.picknpay.co.za/search?text=${encodeURIComponent(it.name)}`,'_blank');
 var checkBtn=document.createElement("button"); checkBtn.textContent="Checkers"; checkBtn.className="small"; checkBtn.onclick=()=>window.open(`https://www.checkers.co.za/search?text=${encodeURIComponent(it.name)}`,'_blank');

 li.appendChild(editBtn); li.appendChild(delBtn); li.appendChild(shopBtn); li.appendChild(pickBtn); li.appendChild(checkBtn);
 ul.appendChild(li);
 });
}


function setBudget() {
 var b=Number(document.getElementById("totalBudget").value);
 if(isNaN(b)||b<0){ toast("Enter valid budget"); return; }
 totalBudget=b; saveAll(); renderOverview(); toast("Budget set");
}

function renderOverview() {
 var sum=items.reduce((acc,it)=>acc+it.total,0);
 document.getElementById("totalCost").textContent=" Total Cost: R"+sum.toFixed(2);
 document.getElementById("peopleCount").textContent=" People: "+members.length;

 var share=members.length>0 ? sum/members.length:0;
 document.getElementById("sharePerPerson").textContent=" Share per person: R"+share.toFixed(2);

 var wrap=document.getElementById("customBreakdown"); wrap.innerHTML="";
 if(splitMode==="custom" && members.length>0){
 var totalCustom=members.reduce((acc,m)=>acc+(m.amount||0),0);
 var note=document.createElement("p"); note.className="muted";
 note.textContent="Custom split total: R"+totalCustom.toFixed(2)+(totalBudget>0?(" | Budget: R"+totalBudget.toFixed(2)):"");
 wrap.appendChild(note);
 members.forEach(m=>{ var line=document.createElement("p"); line.textContent=m.name+" pays: R"+(m.amount||0).toFixed(2); wrap.appendChild(line); });
 }
}



function saveNotes(){ notesText=document.getElementById("notes").value; saveAll(); toast("Notes saved"); }

function printList(){ window.print(); }

function shareWhatsApp(){
if (items.length === 0) { toast("No items to share"); return; } 

var sum = items.reduce((acc, it) => acc + it.total, 0);
var msg = "TrolleySplit\n"; 
msg += "Total: R" + sum.toFixed(2) + "\n";
msg += "People: " + members.length + "\n";
msg += "Items:\n";

for (var j = 0; j < items.length; j++) {
    var it = items[j];
    msg += "- " + it.qty + " x " + it.name + " = R " + it.total.toFixed(2) + "\n";
}
if (splitMode === "even" && members.length > 0) {
msg += "Even split: R" + (sum/members.length).toFixed(2) + " each\n";
} else if (splitMode === "custom") {
msg += "Custom Split:\n";
members.forEach(m => {
  msg += "- " + m.name + ": R" + (m.amount||0).toFixed(2) + "\n";
});
} 

var encodedMsg = encodeURIComponent (msg);

var waURL = "https://api.whatsapp.com/send?text=" + encodedMsg; window.open(waURL, "_blank");
}

function exportCSV(){
 if(items.length===0){ toast("No items to export"); return; }
 var csv="data:text/csv;charset=utf-8,Qty,Item,Price,Total,Category,AddedBy\n";
 items.forEach(it=> csv+=[it.qty,it.name,it.price,it.total,it.category||"",it.addedBy].join(",")+"\n");
 var link=document.createElement("a"); link.setAttribute("href",encodeURI(csv)); link.setAttribute("download","trolleysplit_items.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link);
 toast("CSV exported");
}




function clearAll() {
 if(!confirm("Clear everything?")) return;
 items=[]; members=[]; splitMode="even"; totalBudget=0; notesText="";
 saveAll();
 document.getElementById("splitEven").checked=true; document.getElementById("splitCustom").checked=false;
 toggleCustomAmountInput(); document.getElementById("totalBudget").value=""; document.getElementById("notes").value="";
 renderMembers(); renderItems(); renderOverview(); toast("Cleared");
}