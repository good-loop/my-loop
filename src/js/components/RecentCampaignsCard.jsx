import React from 'react';

const RecentCampaignsCard = () => {
	
	const vertisers = 
			[
				{
					"name": "KitKat",
					"adid": "xsINEuJV",
					"logo": "https://as.good-loop.com/uploads/anon/kithead1-8689246171902103163.png"
				},
				// {
				// 	"name": "Lynx",
				// 	"adid": "i2NidWgu",
				// 	"logo": "https://as.good-loop.com/uploads/anon/lynx-black-9012135637566843772.png"
				// },
				// {
				// 	"name": "Glasgow Credit Union",
				// 	"adid": "rfQVI7tc",
				// 	"logo": "https://as.good-loop.com/uploads/anon/gcu____white-5300781013619689576.png"
				// },
				// {
				// 	"name": "Love Beauty and Planet",
				// 	"adid": "dEQj33ir",
				// 	"logo": "https://as.good-loop.com/uploads/anon/lovebeautyplanet__horizontal-full-logo-2244424493762407107.jpg"
				// },
				// {
				// 	"name": "method",
				// 	"adid": "JvtlN3pk",
				// 	"logo": "https://as.good-loop.com/uploads/anon/methodlogo-1-6990657047366189851.png"
				// },
				{
					"name": "Villa Plus",
					"adid": "lrOQ2Jq3",
					"logo": "https://www.spacecity.co.uk/wp-content/uploads/2018/03/Villa-Plus.png"
				},
				{
					"name": "Linda McCartney",
					"adid": "qprjFW1H",
					"logo": "https://cookschool.club/wp-content/uploads/2018/09/imageedit_1_9636644754-300x200.png"
				},
				{
					"name": "Persil",
					"adid": "2loo5PtL",
					"logo": "https://i.pinimg.com/originals/b7/dc/2e/b7dc2e499618bf9e345dcf4335eb408e.png"
				},
				{
					"name": "Cappy",
					"adid": "2dsE6F5g",
					"logo": "https://as.good-loop.com/uploads/anon/kisspng-or871378622657345-8807730161052821806.png"
				},
				// {
				// 	"name": "Sunbites",
				// 	"adid": "2ROGntyn",
				// 	"logo": "https://as.good-loop.com/uploads/anon/sunbites-logo-1220401756647184148.png"
				// },

				// {
				// 	"name": "Elf Pets",
				// 	"adid": "91NPl6ab",
				// 	"logo": "https://as.good-loop.com/uploads/anon/Screen_Shot_2018-11-19_at_10.12.02-8445321654427265690.png"
				// }
			];
	return (
		<div className="vertiser-row">
			{	vertisers.map(x => <a href={"//my.good-loop.com/#campaign/?gl.vert="+x.adid} target="_blank"><img src={x.logo} alt={x.name}/></a>)	}
		</div>		
	);
};

export default RecentCampaignsCard;