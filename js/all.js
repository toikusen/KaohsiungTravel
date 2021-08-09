//產生XMLHttpRequest，透過他跟伺服器去撈資料
var xhr = new XMLHttpRequest();
xhr.open('get','https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json');
xhr.send(null);
xhr.onload = function(){
    var Data = JSON.parse(xhr.responseText);
    var dataLeng = Data.result.records.length;

    //DOM
    var select = document.querySelector('.select');
    var selectArea = document.querySelector('.selectArea');
    var placeName = document.querySelector('.content')
    
    //生成地區的陣列
    //areaList陣列必須放在迴圈外面，不然每做一次迴圈就會產生一個新的陣列
    var areaList = [];
    //設一個迴圈把opendata的資料放入areaList
    for (var i=0; i<dataLeng; i++){
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

    //下拉選單更改地區名稱
    function updateArea(e){
        var selectValue =  e.target.value;
        var strArea = '';
        for (var i=0; i<dataLeng; i++){
            if (selectValue == Data.result.records[i].Zone){
                strArea = `<h2>${Data.result.records[i].Zone}</h2>`
                console.log(strArea);
            }
        }
        selectArea.innerHTML = strArea;
    }
    select.addEventListener('change',updateArea,false);



    //下拉選單更改地區內容
    function updateContent(e){
        var selectValue = e.target.value;
        //景點資料
        var nameList = [];
        var imgList = [];
        var timeList = [];
        var addressList = [];
        var phoneList = [];
        var strContent = '';

        for (var i=0; i<dataLeng; i++){
            nameList = (Data.result.records[i].Name);
            imgList = (Data.result.records[i].Picture1);
            timeList = (Data.result.records[i].Opentime);
            addressList = (Data.result.records[i].Add);
            phoneList = (Data.result.records[i].Tel);
            ticketList = (Data.result.records[i].Ticketinfo);
            if (selectValue == Data.result.records[i].Zone){
                strContent +=
                `
                <div class="attractions">         
                    <ul>
                        <li>
                            <div class="picture" style="background:url('${imgList}')">
                                <h3>${nameList}</h3>   
                            </div>
                            <div class="info">                          
                                <p><img src="./picture/icons_clock.png" alt=""> ${timeList}</p>       
                                <p><img src="./picture/icons_pin.png" alt=""> ${addressList}</p>  
                                <p><img src="./picture/icons_phone.png" alt=""> ${phoneList}</p>  
                            </div>
                            <div class="ticket">
                                <p><img src="./picture/icons_tag.png" alt=""> ${ticketList}</p> 
                            </div>
                        </li>
                    </ul>
                </div>
                `
            }

        }
        placeName.innerHTML = strContent;
        }

    select.addEventListener('change',updateContent,false);
}

