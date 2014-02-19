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
        // watch: {
        //     files: [src_folder+'styles/pickers.css', src_folder+'scripts/pickers.js'],
        //         tasks: ['build']
        // },
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
                importPath:  src_folder+'bower_components',
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
					{src: dist_folder+'scripts/pickers.js', dest: dist_folder+'pickers.min.js'},
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
                    'dist/styles/pickers.min.css': [
                        src_folder+'styles/pickers.css'
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
                            'styles/pickers.css',
                            'styles/fonts/{,*/}*.*'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: src_folder+'scripts',
                        dest: dist_folder,
                        src: [
                            'pickers.js'
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
        'copy',
        'imagemin',
        'uglify',
        'cssmin'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);

    //  grunt.registerTask('watch', [
    //     'build',
    //     'watch'
    // ]);
};
