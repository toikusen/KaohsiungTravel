// //產生XMLHttpRequest，透過他跟伺服器去撈資料
var xhr = new XMLHttpRequest();
xhr.open('get','https://api.kcg.gov.tw/api/service/get/9c8e1450-e833-499c-8320-29b36b7ace5c');
xhr.send(null);
xhr.onload = function(){
    var api = JSON.parse(xhr.responseText);
    console.log(api)
    //將json資料整理成較好看的形式方便之後使用
    var info = api.data.AttractionList.Attractions.Attraction;
    var dataLen = info.length;

    var placeMap = new Map();
    var zipcodeList = new Array();
    var AddList = new Array();

    for(var i = 0; i < dataLen; i++){
        var allInfo = info[i]; //去遍歷原本資料中的每一項
        var zipcode = allInfo.PostalAddress.ZipCode;
        var zipcodeIndex = placeMap.get(zipcode);//取得zipcode對應的索引值
        if(zipcodeIndex == null){ //如果沒有這個zipcode，則生成一個新的陣列來存放zipcode跟data
            placeData =new Array();
            placeData.push(allInfo);
            placeMap.set(zipcode,placeData);
            zipcodeList.push(zipcode);
            AddList.push(allInfo.PostalAddress.Town);//在產生單一筆不重複資料時就將這筆Add取出用來找名稱
        
        }else{ //如果取得的zipcode已經存在了，那就在該位置產生對應的資料
            zipcodeIndex.push(allInfo);
        }
    }


    //用Zipcode從Add找出區域名稱的方法
    var zoneList = new Array();
    for(var i = 0; i<zipcodeList.length; i++){
        var firstIndexOf = AddList[i].indexOf(zipcodeList[i]);
        var lastIndexOf = AddList[i].indexOf('區');

        zone = AddList[i].slice(firstIndexOf+zipcodeList[i].length,lastIndexOf+1)
        zoneList.push(zone);
        
    }

    //生成zoneMap來對應zipcode
    var zoneMap = new Map();
    for(var i = 0; i<AddList.length; i++){
        zoneMap.set(AddList[i],zipcodeList[i])    
    }



    //DOM
    var selectDropDownList = document.querySelector('#selectDropDownList');
    var selectAreaTitle = document.querySelector('#selectArea');
    var contentMessage = document.querySelector('#content');
    var detailMessage = document.querySelector('#detailMessage');
    var previousButton = document.querySelector('#previousButton');
    var numButton = document.querySelector('#numButton');
    var nextButton = document.querySelector('#nextButton');
    var placeButton = document.querySelectorAll('.placeButton');

    // 預設當前頁為第一頁
    var pageNum = 1;
    // 每一個分頁顯示的數量 -> 6 筆
    var CONTENT_NUM = 6;
    // 頁碼數量
    var pageLeng = 0;

    //產生下拉選單的方法
    defaultSelect = '<option disabled selected>--請選擇地區--</option>';
    strAreaList = '';
    for (var i=0; i<zoneList.length; i++){
        // var areaOption = document.createElement('option');
        //areaOption.value = area[i];
        // areaOption.textContent = area[i];
        // selectDropDownList.appendChild(areaOption);
        strAreaList += '<option value="'+AddList[i]+'">'+AddList[i]+'</optiion>';
    }
    selectDropDownList.innerHTML = defaultSelect + strAreaList;


    //更新資料的方法
    function updateData(e){
        updateArea(e.target.value);
        updateContent(e.target.value);
    }
    selectDropDownList.addEventListener('change',updateData,false);

    //迴圈對應每個按鈕，點選按鈕更改地區
    for(var i =0;i<placeButton.length;i++){
        placeButton[i].addEventListener('click',updateData,false);
    };

    //下拉選單更改地區名稱
    var selectValue = '';
    function updateArea(e){
        pageNum = 1; // 改地區之後要回到第一頁，也正因為改地區會整個把內容重改，而像換頁只會改內容，所以要跟改內容分開做
        selectValue =  e;       
        strArea = '<h2>'+selectValue+'</h2>';
        selectAreaTitle.innerHTML = strArea;
        selectDropDownList.value = selectValue;
    }

    //下拉選單更改地區內容
    function updateContent(selectValue){  
        var zonePlace = zoneMap.get(selectValue);
        var arrayPlace = placeMap.get(zonePlace);
        //設計分頁要顯示的資料
        //幾頁會顯示幾筆資料 -> 頁碼乘以每頁顯示數量6筆
        var pageContentNum = pageNum * CONTENT_NUM;
        //該頁的第一筆資料為幾頁會顯示幾筆資料-每頁顯示數量6筆（例如：第一頁第一筆為1x6-6=0，第二頁第一筆為2x6-6=6）
        var start = pageContentNum-CONTENT_NUM;
        //每頁最後一筆資料起始值設為該地區景點數量
        var end = arrayPlace.length;
        //如果該地區景點數量大於幾頁會顯示幾筆資料， 那就將該頁顯示的資料數設為最後一個要顯示的資料
        //小於則將該地區景點數就設為最後一個資料
        if(end > pageContentNum) {
            end = pageContentNum;
        } else {
            end = arrayPlace.length;
        }   
        var strContent = '';
        var n;
        for(n = start;n<end;n++){
            strContent +=
            '<div class="attractions">\
                <ul>\
                    <li class="li">\
                        <div class="picture" style="background:url('+arrayPlace[n].Images+')">\
                            <h3>'+arrayPlace[n].AttractionName+'</h3>\
                            <h2>'+selectValue+'</h2>\
                            </div><div class="info">\
                            <p><img src="./picture/icons_pin.png" alt=""> '+arrayPlace[n].PostalAddress.StreetAddress+'</p>\
                            <p><img src="./picture/icons_phone.png" alt=""> '+arrayPlace[n].Telephones.Telephone.Tel+'</p>\
                            <p><img src="./picture/icons_tag.png" alt=""></p>\
                        </div>\
                    </li>\
                </ul>\
            </div>'                    
        }
        contentMessage.innerHTML = strContent;

        //計算分頁數量的方法
        countPageNum(arrayPlace.length);

        //Detail的DOM必須要放在updateContent裡面，才能重新抓取不同的li
        var li = document.querySelectorAll('.li');     
        function detail(e){
            for (var x=0; x<dataLen; x++){
                //Deatail方法，先設定好一開始要顯示的位置
                var scrollTop = document.documentElement.scrollTop;
                var scrollLeft = document.documentElement.scrollLeft;
                var top = (document.documentElement.clientHeight - document.getElementById("detail").offsetHeight) / 2;
                var left = (document.documentElement.clientWidth - document.getElementById("detail").offsetWidth) / 2; 
                document.getElementById("detail").style.top = (scrollTop + top) + "px"; 
                document.getElementById("detail").style.left = (scrollLeft + left) + "px"; 
                var selectName = e.srcElement.innerHTML;          
                if (selectName == info[x].AttractionName){  
                    strDetail = 
                    '\
                    <h1>'+info[x].AttractionName+'</h1>\
                    <hr>\
                    <br>\
                    <h2>景點介紹：</h2>\
                    <br>\
                    <p>'+info[x].Description+'</p>\
                    ';
                    // 動態設置寬度和高度
                    var detailElement = document.getElementById("detail");
                    detailElement.style.height = "500px"; // 設定框的高度
                    detailElement.style.overflow = "auto"; // 超出範圍顯示滾動條
                    $("#detail").show();     
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

    }

    //換頁方法
    function numChange(e){
        pageNum = parseInt(e.target.textContent);   
        updateContent(selectValue);
    }

    function previous(){
        if(pageNum == 1) {
            pageNum = 1; //頁面到第一頁時候 pageNum = 1
        }else{
            pageNum --; //尚未到第一頁則按下 Previous 進到前一頁
        }
        updateContent(selectValue);
    }

    function next(){
        if(pageNum == pageLeng) { 
            pageNum = pageLeng //頁面到最後一頁時候 pageNum = pageLeng
        }else{
            pageNum ++; //尚未到最後頁面則按下 NEXT 進到下一頁
        }
        updateContent(selectValue);
      }

      previousButton.addEventListener('click',previous,false);
      numButton.addEventListener('click',numChange,false);
      nextButton.addEventListener('click',next,false);

    //生成頁面按鈕的方法
    function countPageNum(num) {
        if(num > CONTENT_NUM) {
            pageLeng = Math.ceil( num / CONTENT_NUM );
            var prevPage = '<button value = "Previous"><a>Previous</a></button>';
            var nextPage ='<button value = "Next"><a>Next</a></button>';
            var page = '';
            for(var i = 1; i<= pageLeng; i++) {
                if(i == pageNum) {
                    page += '<button value = "'+i+'"><a class="active">'+i+'</a></button>';
                } else {
                    page += '<button value = "'+i+'"><a>'+i+'</a></button>';
                }
            }
            previousButton.innerHTML =  prevPage;
            numButton.innerHTML = page;
            nextButton.innerHTML = nextPage;

        } else {
            page = '<button value = "1"><a class="active">1</a></button>';
            numButton.innerHTML = page ;
        }
    }
}