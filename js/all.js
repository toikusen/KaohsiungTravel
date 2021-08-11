//產生XMLHttpRequest，透過他跟伺服器去撈資料
var xhr = new XMLHttpRequest();
xhr.open('get','https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json');
xhr.send(null);
xhr.onload = function(){
    var Data = JSON.parse(xhr.responseText);
    var dataLen = Data.result.records.length;

    //DOM
    var selectDropDownList = document.querySelector('.select');
    var selectAreaTitle = document.querySelector('.selectArea');
    var palaceContent = document.querySelector('.content');
    var placeDetail = document.querySelector('.detail .placeDetail');
    var pagination = document.querySelector('.pagination');
    var placeButton = document.querySelectorAll('.btn');

    // 當前頁
    var pageNum = 1;
    // 每一個分頁顯示的數量 -> 6 筆
    var CONTENT_NUM = 6;
    // 頁碼數量
    let pageLeng = 0;

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
        selectDropDownList.appendChild(areaOption);
        // select.innerHTML = `<option>${area}</optiion>`
    }

    //熱門景點按鈕
    for(var i =0;i<placeButton.length;i++){
        placeButton[i].addEventListener('click',updateArea,false)
        placeButton[i].addEventListener('click',updateContent,false)
    };

    var selectValue = '';
    function selectZone(){    
        for (var i=0; i<dataLen; i++){
            if (selectValue == Data.result.records[i].Zone){
                strArea = `<h2>${selectValue}</h2>`;
            }
        }

    }

    
    
    //下拉選單更改地區名稱
    function updateArea(e){
        pageNum = 1; // 改地區之後要回到第一頁
        selectValue =  e.target.value;       
        selectZone(e);
        selectAreaTitle.innerHTML = strArea;
    }
    selectDropDownList.addEventListener('change',updateArea,false);


    //下拉選單更改地區內容
    function updateContent(e){

        //景點資料
        var nameList = [];
        var zoneList = [];
        var imgList = [];
        var timeList = [];
        var addressList = [];
        var phoneList = [];
        var ticketList = [];
        var strContent = '';


        for (var i=0; i<dataLen; i++){

            if (selectValue == Data.result.records[i].Zone){
  
                nameList.push(Data.result.records[i].Name);
                zoneList.push(Data.result.records[i].Zone);
                imgList.push(Data.result.records[i].Picture1);
                timeList.push(Data.result.records[i].Opentime);
                addressList.push(Data.result.records[i].Add);
                phoneList.push(Data.result.records[i].Tel);
                ticketList.push(Data.result.records[i].Ticketinfo);
                
            }

        }


        // 選取開始的陣列位置 -> 頁碼乘以每頁顯示數量
        var pageContentNum = pageNum * CONTENT_NUM;
        var start = pageContentNum-CONTENT_NUM
        var end = zoneList.length;
        // 頁數
        countPageNum(end);
        // 如果長度大於 start，以 pageContentNum 作為迴圈停止條件
        if(end > pageContentNum) {
            end = pageContentNum;
        } else {
            end = zoneList.length;
        }
        

        var n =0;
        for(n = start;n<end;n++){
            strContent +=
            `
            <div class="attractions">         
                <ul>
                    <li class="li">
                        <div class="picture" style="background:url('${imgList[n]}')">
                            <h3>${nameList[n]}</h3>
                            <h2>${zoneList[n]}</h2>   
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

        palaceContent.innerHTML = strContent;

        //抓取目前瀏覽器的高度與寬度
        var hei = $(document).height();
		var wid = $(document).width();
        //Detail的DOM必須要放在updateContent裡面，才能重新抓取不同的li
        var li = document.querySelectorAll('.li');
        function detail(e){
            for (var x=0; x<dataLen; x++){
                var selectName = e.path[0].innerHTML;
                if (selectName == Data.result.records[x].Name){  
                    strDetail = 
                    `
                    <h1>詳細資訊：</h1>
                    <hr>
                    <h2>景點介紹</h2>
                    <br>
                    <p>${Data.result.records[x].Description}</p>
                    `;

                    var top = ($(window).height() - $("#detail").height())/2;   
                    var left = ($(window).width() - $("#detail").width())/2;   
                    var scrollTop = $(document).scrollTop();   
                    var scrollLeft = $(document).scrollLeft();    
                    $("#detail").css( { position : 'absolute', 'top' : top + scrollTop, left : left + scrollLeft } ).show();     
                }
            }
            placeDetail.innerHTML = strDetail;
        }

        for(var i =0;i<li.length;i++){
            li[i].addEventListener('click',detail,false)
        };

        $("#close").click(function(){			
            $("#detail").hide();			
        });
    }

    selectDropDownList.addEventListener('change',updateContent,false);


    function countPageNum(num) {
        if(num > CONTENT_NUM) {
          pageLeng = Math.ceil( num / CONTENT_NUM );
          var prevPage = `<li><a>< Previous</a></li>`;
          var nextPage =`<li><a>Next ></a></li>`;
          var str = '';
          for(var i = 1; i<= pageLeng; i++) {
            if(i == pageNum) {
            str += `<li><a class="active">${i}</a></li>`;
            } else {
            str += `<li><a>${i}</a></li>`;
            }
          } 
           pagination.innerHTML = prevPage + str + nextPage;
      
        } else {
           str = `<li><a class="active">1</a></li>`;
             pagination.innerHTML = str ;
        }
      
    }
      
      function changePage(e){
        e.preventDefault();
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

