#  Sample AEM project template 

This is a project template for AEM-based applications. It is intended as a best-practice set of examples as well as a potential starting point to develop your own functionality.

## Modules

The main parts of the template are:

* core: Java bundle containing all core functionality like OSGi services, listeners or schedulers, as well as component-related Java code such as servlets or request filters.
* ui.apps: contains the /apps (and /etc) parts of the project, ie JS&CSS clientlibs, components, templates.
* ui.content: contains sample content using the components from the ui.apps
* ui.frontend: contains React components.

## Released Builds/Packages
AEM package for the component 

* [`aem-learning.all-x.x.x.zip`](https://github.com/adobe/adobe-learning-manager-reference-site/releases/latest): Build for AEM as a Cloud Service
* [`aem-learning.all-x.x.x-classic.zip`](https://github.com/adobe/adobe-learning-manager-reference-site/releases/latest): Package for AEM 6.5+

## How to build

To build all the modules run in the project root directory the following command with Maven 3:

    mvn clean install
    
This will build only the artefacts for an AEM as a Cloud Service target. To build the artefacts for AEM on-premise as target use the -Pclassic profile:

    mvn clean install -Pclassic

If you have a running AEM instance you can build and package the whole project and deploy into AEM with

    mvn clean install -PautoInstallPackage

Or to deploy it to a publish instance, run

    mvn clean install -PautoInstallPackagePublish

Or alternatively

    mvn clean install -PautoInstallPackage -Daem.port=4503

Or to deploy only the bundle to the author, run

    mvn clean install -PautoInstallBundle

The `classic` profile can be combined with either of the examples mentioned above.

## Testing

There are three levels of testing contained in the project:

* unit test in core: this show-cases classic unit testing of the code contained in the bundle. To test, execute:

    mvn clean test


## ClientLibs

The frontend module is made available using an [AEM ClientLib](https://helpx.adobe.com/experience-manager/6-5/sites/developing/using/clientlibs.html). When executing the NPM build script, the app is built and the [`aem-clientlib-generator`](https://github.com/wcm-io-frontend/aem-clientlib-generator) package takes the resulting build output and transforms it into such a ClientLib.

A ClientLib will consist of the following files and directories:

- `css/`: CSS files which can be requested in the HTML
- `css.txt` (tells AEM the order and names of files in `css/` so they can be merged)
- `js/`: JavaScript files which can be requested in the HTML
- `js.txt` (tells AEM the order and names of files in `js/` so they can be merged
- `resources/`: Source maps, non-entrypoint code chunks (resulting from code splitting), static assets (e.g. icons), etc.

## Maven settings

The project comes with the auto-public repository configured. To setup the repository in your Maven settings, refer to:

    http://helpx.adobe.com/experience-manager/kb/SetUpTheAdobeMavenRepository.html
