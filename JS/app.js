

//門診時間
let HOURS = [];
  

//先拿到畫面上會動的元素
const hoursBody = document.getElementById("hoursBody");
const todayBox = document.getElementById("today");
const form = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const moreButton = document.getElementById("moreButton");
const moreInfo = document.getElementById("moreInfo");
const bigButton =document.getElementById("bigButton");
const fhirButton = document.getElementById("fhirButton");
const fhirInfo =document.getElementById("fhirInfo");

// 讀取門診時間
async function loadHours() {
try{
    const res = await fetch("data/hours.json");
    if (!res.ok) {
        throw new Error("HTTP " + res.status); 
        }  
        HOURS = await res.json();
        renderHours();
        showToday();
} 
    catch(error){
        hoursBody.innerHTML = '<tr><td colspan="4" class="text-danger">'+ "門診時間載入失敗：" + error.message + "</td></tr>";
        todayBox.textContent = "門診時間載入失敗";
    }
}

//讀取FHIR伺服器
fhirButton.addEventListener("click" , async function () {
    fhirInfo.textContent = "問問看…";
    try {
        const res = await fetch("https://hapi.fhir.org/baseR4/metadata");
        if (!res.ok){
            throw new Error("HTTP " + res.status);
        }
        const matadata = await res.json();
        fhirInfo.textContent = "伺服器的名稱/FHIR版本 " + matadata.software.name+ "," + matadata.fhirVersion;
} 
catch (error){
    fhirInfo.textContent = "有問題" + error.message;
}
});


//一格:看診休診
function cell(open){
    if(open){
        return "<td>看診</td>";
    }
    else{
        return '<td class="text-muted">休診</td>';
    }
}

//把HOUR畫成表格
function renderHours(){
    let html = "";

    const todayIndex =new Date().getDay();

    for(const h of HOURS){
        let highLightClass =(h.day === todayIndex) ? "table-warning" : "" ;

        html += '<tr class="' +highLightClass + '">' + "<th>" + h.name + "</th>" +cell(h.am) + cell(h.pm) + cell(h.night) + "</tr>";
    }
    hoursBody.innerHTML = html;
}

renderHours();

//今天有沒有看診
function showToday(){
    const d = new Date().getDay();
    let today = null;
    for(const h of HOURS){
        if(h.day === d){
            today = h;
        }
    }
    if (!today) {
        todayBox.textContent = "今天(星期二) 休診";
        return;
    }

    const open = [];
    if(today.am) open.push("上午");
    if(today.pm) open.push("下午");
    if(today.night) open.push("晚上");

todayBox.textContent = open.length === 0 
        ? `今天(${today.name}) 休診` 
        : `今天(${today.name})看診時段: ${open.join("/")}`;
}

showToday();



//表單送出

form.addEventListener("submit", function(event){
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    if(name===""){
        formMessage.textContent = "請輸入姓名";
        return;
    }
    if(!/^[0-9]{8,10}$/.test(phone)){
        formMessage.textContent = "請輸入正確電話號碼 8到10碼";
        return;
    }
    if(email !== ""&& !email.includes("@")){
        formMessage.textContent = "Email 格式不對:要有@";
        return;
    }
    if (email !== "") {
    
    formMessage.textContent = "已收到您的資料，謝謝！" + name + "，我們會儘快與您聯絡。";
}


    form.reset();
});

//看更多 按鈕
moreButton.addEventListener("click", function(){
    moreInfo.classList.toggle("d-none");
});

//字體放大按鈕
bigButton.addEventListener("click", () => {
    document.body.classList.toggle("big");

    if(document.body.classList.contains("big")){
        bigButton.textContent = "字體恢復";
    } else{
        bigButton.textContent ="字體放大";
    }
});

renderHours();
showToday();
loadHours()