

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

// 載入最新消息
async function loadNews() {
    const newsList = document.getElementById("newsList");

    // 顯示載入中
    newsList.innerHTML = '<li class="list-group-item">載入中…</li>';

    try {
        // 讀取 JSON
        const res = await fetch("data/new.json");

        // 檢查是否成功
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        // 取得 JSON 資料
        const news = await res.json();

        // 清空原本內容
        newsList.innerHTML = "";

        // 用迴圈產生消息
        for (const item of news) {
            const li = document.createElement("li");

            li.className = "list-group-item";

            li.innerHTML = `
                ${item.date}　
                <span class="badge bg-primary">${item.tag}</span>
                ${item.title}
            `;

            newsList.appendChild(li);
        }

    } catch (err) {
        newsList.innerHTML =
            `<li class="list-group-item text-danger">
                最新消息載入失敗：${err.message}
            </li>`;
    }
}

// 執行函式
loadNews();

// 載入醫師資料
async function loadDoctors() {

    const doctorCards = document.getElementById("doctorCards");

    // 1. 顯示載入中
    doctorCards.innerHTML = `
        <div class="col-12">
            <div class="alert alert-info">
                醫師資料載入中…
            </div>
        </div>
    `;

    try {

        // 2. 讀取 JSON
        const res = await fetch("data/doctor.json");

        // 3. 檢查 HTTP 狀態
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        // 4. 取得 JSON 資料
        const doctors = await res.json();

        // 5. 清空原本內容
        doctorCards.innerHTML = "";

        // 6. 用迴圈產生三張卡片
        for (const doctor of doctors) {

            const card = document.createElement("div");

            card.className = "col-md-4";

            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">

                        <h5 class="card-title">
                            ${doctor.name}
                        </h5>

                        <span class="badge bg-primary">
                            ${doctor.dept}
                        </span>

                        <p class="card-text mt-3">
                            <strong>專長：</strong>
                            ${doctor.specialty}
                        </p>

                        <p class="card-text">
                            <strong>看診時間：</strong>
                            ${doctor.time}
                        </p>

                    </div>
                </div>
            `;

            doctorCards.appendChild(card);
        }

    } catch (err) {

        // 7. 載入失敗
        doctorCards.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    醫師資料載入失敗：${err.message}
                </div>
            </div>
        `;

    }
}

// 第一次載入醫師資料
loadDoctors();

// 按下重新載入按鈕
document.getElementById("reloadDoctors")
    .addEventListener("click", loadDoctors);

renderHours();
showToday();
loadHours()