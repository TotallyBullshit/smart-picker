'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // which project to work with
    var src_folder = 'src/';
    var dist_folder = 'dist/';
    //option
    //var test = grunt.option('test');

    var gruntConfig = {
        //simple watch task
        watch: {
             files: [src_folder+'styles/*.scss',src_folder+'scripts/smart-picker.js'],
             tasks: ['build']
        },
        clean: {
          build: {
            src: [dist_folder]
          }
        },
        compass: {
            options: {
                sassDir: src_folder+'styles',
                cssDir:  src_folder+'styles',
                generatedImagesDir:  src_folder+'images/generated',
                imagesDir:  src_folder+'images',
                javascriptsDir:  src_folder+'scripts',
                fontsDir:  src_folder+'styles/fonts',
                importPath:  'lib',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    generatedImagesDir:  dist_folder+'images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
		uglify: {
			dist: {
				files: [
					{src: dist_folder+'smart-picker.js', dest: dist_folder+'smart-picker.min.js'},
				]
			}
		},
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: src_folder+'images',
                        src: '{,*/}*.{gif,jpeg,jpg,png}',
                        dest: dist_folder+'images'
                    }
                ]
            }
        },
        cssmin: {
            dist: {
                files: {
                    'dist/styles/smart-picker.min.css': [
                        src_folder+'styles/smart-picker.css'
                    ]
                },
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
						cwd: src_folder,
						dest: dist_folder,
                        src: [
                            '*.{ico,png,txt}',
                            'images/{,*/}*.{gif,jpg,jpeg,png,svg,webp}',
                            'styles/smart-picker.css',
                            'styles/fonts/{,*/}*.*'
                        ]
                    }
                ]
            },
            picker: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: src_folder+'scripts/',
                        dest: dist_folder,
                        src: [
                            'smart-picker.js'
                        ]
                    }
                ]
            }
        }
    };

    grunt.initConfig(gruntConfig);


    grunt.registerTask('build', [
        'clean',
        'compass',
        'copy:dist',
        'copy:picker',
        'imagemin',
        'uglify',
        'cssmin'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);

    grunt.registerTask('live', [
        'build',
        'watch'
    ]);
};
