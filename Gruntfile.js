module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mrdoc : {
			all : {
				src: ['lib/'],
				target: 'doc',
				options: {
					//debug: true
					title : "FakeLMS"
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-mrdoc');

	// generating documentation
	grunt.registerTask('doc', ['mrdoc:all']);
};