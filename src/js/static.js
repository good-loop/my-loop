import $ from 'jquery';

// TODO no-react methods for static html landing pages

/** TickerTotal 
*/
const startMoney = 1501886.40;
const startTime = new Date(1606220478753);
const rate = 0.1;

function showMeTheMoney() {
	const timeDiff = startTime ? Date.now() - startTime.getTime() : 0;
	const valDiff = (timeDiff / 1000) * rate;
	const money = startMoney + valDiff;
	let options = {
		minimumFractionDigits:2,
		maximumFractionDigits:2
	};
	let sm = new Intl.NumberFormat('en-GB', options).format(money);
	let s = "$"+sm;
	let html = "";
	// make the font effectively fixed-width
	for(let i=0; i<s.length; i++) {
		html += '<span style="width:'+(s[i]===','||s[i]==='.'? '0.3' : '0.6')+'em;">'+s[i]+'</span>';
	}
	$('#TickerTotal').html(html);	
};
showMeTheMoney();
setInterval(showMeTheMoney, 1000);
