//產生XMLHttpRequest，透過他跟伺服器去撈資料
var xhr = new XMLHttpRequest();
xhr.open('get','https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json');
xhr.send(null);
xhr.onload = function(){
    var Data = JSON.parse(xhr.responseText);
    var dataLen = Data.result.records.length;

    //DOM
    var selectDropDownList = document.querySelector('#select');
    var selectAreaTitle = document.querySelector('#selectArea');
    var contentMessage = document.querySelector('#content');
    var detailMessage = document.querySelector('#detailMessage');
    var pagination = document.querySelector('#pagination');
    var placeButton = document.querySelectorAll('.placeButton');

    // 預設當前頁為第一頁
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

    //將陣列分類，areaList因為有重複值，所以用Set儲存成唯一值
    // var area = Array.from(new Set(areaList));
    var area = areaList.filter(function(element, index, arr){
        return arr.indexOf(element) === index;
    });
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
        placeButton[i].addEventListener('click',updateData,false)
    };

    //用來判斷點選的地區，並整理該地區的資料
    var selectValue = '';
    function selectZone(){       
        //景點資料
        nameList = [];
        zoneList = [];
        imgList = [];
        timeList = [];
        addressList = [];
        phoneList = [];
        ticketList = [];
        
        for (var i=0; i<dataLen; i++){
            if (selectValue == Data.result.records[i].Zone){
                strArea = '<h2>'+selectValue+'</h2>';

                nameList.push(Data.result.records[i].Name);
                zoneList.push(Data.result.records[i].Zone);
                imgList.push(Data.result.records[i].Picture1);
                timeList.push(Data.result.records[i].Opentime);
                addressList.push(Data.result.records[i].Add);
                phoneList.push(Data.result.records[i].Tel);
                ticketList.push(Data.result.records[i].Ticketinfo);
            }
        }     
    }

    function updateData(e){
        updateArea(e);
        updateContent(e);
    }
    
    //下拉選單更改地區名稱
    function updateArea(e){
        pageNum = 1; // 改地區之後要回到第一頁
        selectValue =  e.target.value;       
        selectZone();
        selectAreaTitle.innerHTML = strArea;
    }
    selectDropDownList.addEventListener('change',updateArea,false);

    //下拉選單更改地區內容
    function updateContent(e){  
        selectZone();
        //設計分頁要顯示的資料
        //幾頁會顯示幾筆資料 -> 頁碼乘以每頁顯示數量6筆
        var pageContentNum = pageNum * CONTENT_NUM;
        //該頁的第一筆資料為幾頁會顯示幾筆資料-每頁顯示數量6筆（例如：第一頁第一筆為1x6-6=0，第二頁第一筆為2x6-6=6）
        var start = pageContentNum-CONTENT_NUM;
        //每頁最後一筆資料起始值設為該地區景點數量
        var end = zoneList.length;
        //計算分頁數量的方法
        countPageNum(end);
        //如果該地區景點數量大於幾頁會顯示幾筆資料， 那就將該頁顯示的資料數設為最後一個要顯示的資料
        //小於則將該地區景點數就設為最後一個資料
        if(end > pageContentNum) {
            end = pageContentNum;
        } else {
            end = zoneList.length;
        }
        
        var strContent = '';
        var n =0;
        for(n = start;n<end;n++){
            strContent +=
            '<div class="attractions">\
                <ul>\
                    <li class="li">\
                        <div class="picture" style="background:url('+imgList[n]+')">\
                            <h3>'+nameList[n]+'</h3>\
                            <h2>'+zoneList[n]+'</h2>\
                            </div><div class="info">\
                            <p><img src="./picture/icons_clock.png" alt=""> '+timeList[n]+'</p>\
                            <p><img src="./picture/icons_pin.png" alt=""> '+addressList[n]+'</p>\
                            <p><img src="./picture/icons_phone.png" alt=""> '+phoneList[n]+'</p>\
                        </div>\
                        <div class="ticket">\
                            <p><img src="./picture/icons_tag.png" alt=""> '+ticketList[n]+'</p>\
                        </div>\
                    </li>\
                </ul>\
            </div>'                    
        }

        contentMessage.innerHTML = strContent;

        //Detail的DOM必須要放在updateContent裡面，才能重新抓取不同的li
        var li = document.querySelectorAll('.li');     
        function detail(e){
            for (var x=0; x<dataLen; x++){
                var selectName = e.path[0].innerHTML;
                if (selectName == Data.result.records[x].Name){  
                    strDetail = 
                    '\
                    <h1>'+Data.result.records[x].Name+'</h1>\
                    <hr>\
                    <br>\
                    <h2>景點介紹：</h2>\
                    <br>\
                    <p>'+Data.result.records[x].Description+'</p>\
                    ';
                    var top = ($(window).height() - $("#detail").height())/2;   
                    var left = ($(window).width() - $("#detail").width())/2;   
                    var scrollTop = $(document).scrollTop();   
                    var scrollLeft = $(document).scrollLeft();    
                    $("#detail").css( { position : 'absolute', 'top' : top + scrollTop, left : left + scrollLeft } ).show();     
                }
            }
            detailMessage.innerHTML = strDetail;
        }

        //根據點選的景點li去顯示詳細介紹
        for(var i =0;i<li.length;i++){
            li[i].addEventListener('click',detail,false)
        };

        //關閉按鈕
        $("#close").click(function(){			
            $("#detail").hide();			
        });

        function changePage(e){
            if(e.target.textContent == 'Next >') {
                if(pageNum == pageLeng) { 
                    pageNum = pageLeng //頁面到最後一頁時候 pageNum = pageLeng
                }else{
                    pageNum ++; //尚未到最後頁面則按下 NEXT 進到下一頁
                }
            }else if(e.target.textContent == '< Previous') {
                if(pageNum == 1) {
                    pageNum = 1; //頁面到第一頁時候 pageNum = 1
                }else{
                    pageNum --; //尚未到第一頁則按下 Previous 進到前一頁
                }
            }else {
                pageNum = parseInt(e.target.textContent);
            }       
            updateContent();
          }
          pagination.addEventListener('click', changePage,false);

    }

    selectDropDownList.addEventListener('change',updateContent,false);

    //生成頁面按鈕的方法
    function countPageNum(num) {
        if(num > CONTENT_NUM) {
          pageLeng = Math.ceil( num / CONTENT_NUM );
          var prevPage = '<li><a>< Previous</a></li>';
          var nextPage ='<li><a>Next ></a></li>';
          var page = '';
          for(var i = 1; i<= pageLeng; i++) {
            if(i == pageNum) {
            page += '<li><a class="active">'+i+'</a></li>';
            } else {
                page += '<li><a>'+i+'</a></li>';
            }
          } 
           pagination.innerHTML = prevPage + page + nextPage;
      
        } else {
            page = '<li><a class="active">1</a></li>';
             pagination.innerHTML = page ;
        }
    }
}

