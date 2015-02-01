/// <vs BeforeBuild='copy' />
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	typescript: {
		base: {
		  src: ['src/**/*.ts'],
		  dest: 'build/webmetaverse.js',
		  options: {
			target: 'es5', //or es3
			basePath: 'path/to/typescript/files',
			sourceMap: true,
			declaration: false
		  }
		}
	  },
	watch: {
	  scripts: {
		files: ['src/**/*.ts'],
		tasks: ['typescript'],
		options: {
		  spawn: false,
		  },
		},
	 },
	 copy: {
	  main: {
		files: [
		  // Copy static files to build
		  {expand: true, flatten:true , src: ['static/*'], dest: 'build/'},
		  // Copy JS libs to build
		  {expand: true, flatten:true , src: ['lib/*'], dest: 'build/'}
		],
	  },
	},
		  
	  
	  
  });

  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('server', ['watch']);
  grunt.registerTask('full', ['copy', 'typescript']);
  grunt.registerTask('default', ['typescript']);

};