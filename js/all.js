//產生XMLHttpRequest，透過他跟伺服器去撈資料
var xhr = new XMLHttpRequest();
xhr.open('get','https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json');
xhr.send(null);
xhr.onload = function(){
    var Data = JSON.parse(xhr.responseText);
    var dataLen = Data.result.records.length;

    //DOM
    var select = document.querySelector('.select');
    var selectArea = document.querySelector('.selectArea');
    var placeName = document.querySelector('.content')
    var pagination = document.querySelector('.pagination');
    var btn = document.querySelectorAll('.btn');

    // 當前頁
    var pageNum = 1;
    // 每一個分頁顯示的數量 -> 6 筆
    var contentNum = 6;
    // 頁碼數量
    let pageLeng = 0;
    var selectAreaLen = [];
    var selectLen = [];

    //生成地區的陣列
    //areaList陣列必須放在迴圈外面，不然每做一次迴圈就會產生一個新的陣列
    var areaList = [];
    //設一個迴圈把opendata的資料放入areaList
    for (var i=0; i<dataLen; i++){
        areaList.push(Data.result.records[i].Zone);
    }

    //areaList因為有重複值，所以用Set儲存成唯一值
    var area = Array.from(new Set(areaList));
    //將新的陣列用DOM放入select裡面
    newAreaLen = area.length; 
    for (var i=0; i<newAreaLen; i++){
        var areaOption = document.createElement('option');
        areaOption.textContent = area[i];
        select.appendChild(areaOption);
        // select.innerHTML = `<option>${area}</optiion>`
    }

    //熱門景點選單
    for(i =0;i<btn.length;i++){
        console.log(btn.length)
        btn[i].addEventListener('click',updateArea,false)
        btn[i].addEventListener('click',updateContent,false)
      };

    var selectValue = '';
    //下拉選單更改地區名稱
    function updateArea(e){
        pageNum = 1; // 回到第一頁
        selectValue =  e.target.value;       
        selectAreaLen = [];
        selectLen = [];
        for (var i=0; i<dataLen; i++){
            if (selectValue == Data.result.records[i].Zone){
                strArea = `<h2>${Data.result.records[i].Zone}</h2>`;
                selectAreaLen.push(Data.result.records[i].Zone); 
            }
        }
        selectArea.innerHTML = strArea;
        selectLen = selectAreaLen;
    }
    select.addEventListener('change',updateArea,false);


    //下拉選單更改地區內容
    function updateContent(e){

        //景點資料
        var nameList = [];
        var imgList = [];
        var timeList = [];
        var addressList = [];
        var phoneList = [];
        var ticketList = [];
        var strContent = '';

        // 選取開始的陣列位置 -> 頁碼乘以每頁顯示數量
        var start = pageNum * contentNum;
        var areaLen = selectLen.length;
        // 頁數
        countPageNum(areaLen);
        // 如果長度大於 start，以 start 作為迴圈停止條件
        if(areaLen > start) {
            areaLen = start;
        } else {
            areaLen = selectLen.length;
        }
    	// 以 start - 每頁顯示數量，作為開始條件
        for (var i=0; i<dataLen; i++){

            if (selectValue == Data.result.records[i].Zone){
  
                nameList.push(Data.result.records[i].Name);
                imgList.push(Data.result.records[i].Picture1);
                timeList.push(Data.result.records[i].Opentime);
                addressList.push(Data.result.records[i].Add);
                phoneList.push(Data.result.records[i].Tel);
                ticketList.push(Data.result.records[i].Ticketinfo);
                
            }

        }
        var n =0;
        for(n = start-contentNum;n<areaLen;n++){
            strContent +=
            `
            <div class="attractions">         
                <ul>
                    <li>
                        <div class="picture" style="background:url('${imgList[n]}')">
                            <h3>${nameList[n]}</h3>   
                        </div>
                        <div class="info">                          
                            <p><img src="./picture/icons_clock.png" alt=""> ${timeList[n]}</p>       
                            <p><img src="./picture/icons_pin.png" alt=""> ${addressList[n]}</p>  
                            <p><img src="./picture/icons_phone.png" alt=""> ${phoneList[n]}</p>  
                        </div>
                        <div class="ticket">
                            <p><img src="./picture/icons_tag.png" alt=""> ${ticketList[n]}</p> 
                        </div>
                    </li>
                </ul>
            </div>
            `                    
        }

        placeName.innerHTML = strContent;
    }

    select.addEventListener('change',updateContent,false);


    function countPageNum(num) {
        if(num > contentNum) {
          pageLeng = Math.ceil( num / contentNum );
          var prevPage = `<li><a href="#br">< Previous</a></li>`;
          var nextPage =`<li><a href="#br">Next ></a></li>`;
          var str = '';
          for(var i = 1; i<= pageLeng; i++) {
            if(i == pageNum) {
            str += `<li><a class="active" href="#br">${i}</a></li>`;
            } else {
            str += `<li><a href="#br">${i}</a></li>`;
            }
          } 
           pagination.innerHTML = prevPage + str + nextPage;
      
        } else {
           str = `<li><a class="active" href="#br">1</a></li>`;
             pagination.innerHTML = str ;
        }
      
    }
      
      function changePage(e){
        e.preventDefault();
        // var currentPage = e.target.textContent;
        // console.log(currentPage);
        if(e.target.textContent == 'Next >') {
            if(pageNum == pageLeng) { 
              pageNum = pageLeng // 頁面到最後一頁時候 pageNum = pageLeng
            } else {
              pageNum ++; // 尚未到最後頁面則按下 NEXT 進到下一頁
            }
        } else if(e.target.textContent == '< Previous') {
          if(pageNum == 1) {
            pageNum = 1;
          } else {
            pageNum --;
          }
        } else {
          pageNum = parseInt(e.target.textContent);
        }
        updateContent();

      }
      
      pagination.addEventListener('click', changePage,false);


}

