
const MyLoopSelectors = {
	logIn: "#top-right-menu",
	logged_in_greeting:".dropdown",
	name: 'input[name="name"]',
	gender: 'select[name="gender"]',
	location: 'input[name="location"]',
	job: 'input[name="job"]',
	relationship: 'select[name="relationship"]',
	edit: 'button.edit',
	// "recordDonations":`div.form-group label.radio-inline input[name="cookies"][value="true"]`,
	// "-recordDonations":`div.form-group label.radio-inline input[name="personaliseAds"][value="false"]`,
	"sendMessages":`div.form-group label.radio-inline input[name="sendMessages"][value="true"]`,
	"-sendMessages":`div.form-group label.radio-inline input[name="sendMessages"][value="false"]`,
	"personaliseAds":`div.form-group label.radio-inline input[name="personaliseAds"][value="true"]`,
	"-personaliseAds":`div.form-group label.radio-inline input[name="personaliseAds"][value="false"]`
};

module.exports = MyLoopSelectors;
