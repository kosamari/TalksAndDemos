/*
Script to populate sidebar with some information
*/

var now = new Date();
var count = Math.ceil(now.getTime()/100000);

/*
Load current time and date 
*/
// convert hour val to 01 model
function formatHour(h){
  if(h===0){
    return '12';
  }else if(h<13){
    return h.toString();
  }else{
    return '0' + (h-12);
  }
}

function clock(){
  var date = ('0' + (now.getMonth()+1)).slice(-2)
    +'/'
    +('0' + now.getDate()).slice(-2)
    +'/'
    +now.getFullYear();
  var hour = formatHour(now.getHours());
  var min = ('0'+now.getMinutes()).slice(-2); // Min in 01 format
  var min1 = min.slice(-2, 1); //get 1st digit
  var min2 = min.slice(-1);   //get 2nd digit

  $('.hour').html(hour);
  $('.minute1').html(min1);
  $('.minute2').html(min2);
  $('.date').html(date);
}
clock();
setInterval(clock, 60000);

/*
Load activity monitor with dummy data based on UNIX time stamp
*/
function activity(){
  count += 84;
  $('#activity-data').html(count);
}
activity();
setInterval(activity, 5000);
