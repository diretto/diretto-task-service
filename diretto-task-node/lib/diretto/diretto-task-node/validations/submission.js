module.exports = function(data, response, next, callback) {
	var failed = false;
	var fail = function(msg) {
		response.send(400, {
			error : {
				reason : "Invalid submission entity. " + (msg || "Please check your entity structure.")
			}
		});

		failed = true;
		next();
		return;
	};

	// Check document
	if (!data.document || !data.document.link || !data.document.link.rel || !data.document.link.href) {
		fail("Document invalid.");
		return;
	}
	else {
		if (!(typeof (data.document.link.rel) == 'string')) {
			fail("Invalid link relation.");
			return;
		}
		if (!(typeof (data.document.link.href) == 'string' && data.document.link.href.substr(0, 4) === "http")) {
			fail("Invalid link hyperref.");
			return;
		}
	}

	if (!failed) {
		callback({
			"document" : {
				"link" : {
					"rel" : data.document.link.rel,
					"href" : data.document.link.href
				}
			}
		});
	}
}
