const sass = require("node-sass");

module.exports = grunt => {
  require("load-grunt-tasks")(grunt);

  let port = grunt.option("port") || 8000;
  let root = grunt.option("root") || ".";

  if (!Array.isArray(root)) root = [root];

  const modulesPath = "node_modules";
  const revealJsModulePath = `${modulesPath}/reveal.js`;
  const distPath = `dist`;
  const srcPath = `src`;

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    clean: {
      dist: [distPath],
      html: [`${distPath}/*.html`]
    },

    copy: {
      reveal: {
        expand: true,
        cwd: `${revealJsModulePath}`,
        src: ["css/print/*.css", "css/reset.css", "lib/css/monokai.css"],
        dest: `${distPath}`
      }
    },

    uglify: {
      build: {
        src: `${revealJsModulePath}/js/reveal.js`,
        dest: `${distPath}/js/reveal.min.js`
      },
      plugins: {
        expand: true,
        cwd: `${revealJsModulePath}/plugin`,
        src: ["**/*.js"],
        dest: `${distPath}/plugin`,
        ext: ".js"
      }
    },

    sass: {
      options: {
        implementation: sass,
        sourceMap: false
      },
      core: {
        src: `${revealJsModulePath}/css/reveal.scss`,
        dest: `${distPath}/css/reveal.css`
      },
      custom: {
        expand: true,
        cwd: `${srcPath}/css`,
        src: ["**/*.scss"],
        dest: `${distPath}/css`,
        ext: ".css"
      }
    },

    connect: {
      server: {
        options: {
          port: port,
          base: distPath,
          livereload: true,
          open: true,
          useAvailablePort: true
        }
      }
    },

    "compile-handlebars": {
      slides: {
        files: [
          {
            src: `${srcPath}/index.hbs`,
            dest: `${distPath}/index.html`
          }
        ],
        partials: `${srcPath}/slides/*.hbs`
      }
    },

    watch: {
      custom: {
        files: [`${distPath}/css**/*.scss`],
        tasks: "css-custom"
      },
      html: {
        files: `${srcPath}/**/*.hbs`,
        tasks: "html"
      },
      markdown: {
        files: root.map(path => path + "/*.md")
      },
      options: {
        livereload: true
      }
    }
  });

  // Default task
  grunt.registerTask("default", ["clean:dist", "html", "copy", "css", "js"]);

  // HTML task
  grunt.registerTask("html", ["clean:html", "compile-handlebars"]);

  // JS task
  grunt.registerTask("js", ["uglify"]);

  // Theme CSS
  grunt.registerTask("css-themes", ["sass:themes"]);

  // Core framework CSS
  grunt.registerTask("css-core", ["sass:core"]);

  // All CSS
  grunt.registerTask("css", ["sass"]);

  // Package presentation to archive
  grunt.registerTask("package", ["default", "zip"]);

  // Serve presentation locally
  grunt.registerTask("serve", ["connect", "watch"]);
};
