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

        // Compile SCSS files into CSS (dev mode is not compressed)
        sass: {
            minified: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'dist/styles/smart-picker.min.css': 'src/styles/smart-picker.scss',
                }
            },
            expanded: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'dist/styles/smart-picker.css': 'src/styles/smart-picker.scss',
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
                    },
                ]
            },
            sass: {
                files: {
                    'dist/styles/_smart-picker.scss': [
                        dist_folder+'styles/smart-picker.css'
                    ]
                }
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
        'sass:expanded',
        'sass:minified',
        'copy:dist',
        'copy:picker',
        'copy:sass',
        'imagemin',
        'uglify'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);

    grunt.registerTask('dev', [
        'build',
        'watch'
    ]);
};
