#!/usr/bin/env python
# Modification History
# 01/28/2017 Add jsdoc2md and some print statements to trace what's going on. Brian S Hayes (Hayeswise)
# 02/04/2017 Add if exists check around distribution file rather than use try block.  Brian S Hayes (Hayeswise)

import glob
import time
import re
import io
import base64
import sys
import os
import shutil
import json
import shelve
import hashlib
import subprocess
import time
try:
    from jsmin import jsmin
    minify = True
except ImportError:
    minify = False
    print ("Not able to import jsmin")


try:
  import urllib2
except ImportError:
  import urllib.request as urllib2

# load settings file
from buildsettings import buildSettings

# load option local settings file
try:
    from localbuildsettings import buildSettings as localBuildSettings
    buildSettings.update(localBuildSettings)
except ImportError:
    pass

# load default build
try:
    from localbuildsettings import defaultBuild
except ImportError:
    defaultBuild = None

buildName = defaultBuild

clean = False
verbose = False

# build name from command line
if len(sys.argv) >= 2:	# argv[0] = program, argv[1] = buildname, len=2
    buildName = sys.argv[1]

if len(sys.argv) >= 3:	# argv[0] = program, argv[1] = buildname, option
    for option in sys.argv:
        if option == "-verbose" or option == "--verbose":
            verbose = True;

if buildName is None or not buildName in buildSettings:
    print ("Usage: build.py buildname [--verbose] [--clean]")
    print (" available build names: %s" % ', '.join(buildSettings.keys()))
    print (" if --clean, the files will not be built.")
    sys.exit(1)

# set up vars used for replacements
utcTime = time.gmtime()
buildDate = time.strftime('%Y-%m-%d-%H%M%S',utcTime)
# userscripts have specific specifications for version numbers - the above date format doesn't match
dateTimeVersion = time.strftime('%Y%m%d.',utcTime) + time.strftime('%H%M%S',utcTime).lstrip('0')

verbose and print ("WISE data-clone build, dateTimeVersion=" + dateTimeVersion);
verbose and print ("Get buildSettings[" + buildName + "]")
if buildName in buildSettings:
    settings = buildSettings[buildName]

# extract required values from the settings entry
resourceUrlBase = settings.get('resourceUrlBase')
distUrlBase = settings.get('distUrlBase')


def readfile(fn):
    with io.open(fn, 'Ur', encoding='utf8') as f:
        return f.read()

def loaderString(var):
    fn = var.group(1)
    return readfile(fn).replace('\n', '\\n').replace('\'', '\\\'')

def loaderRaw(var):
    fn = var.group(1)
    return readfile(fn)

def loaderMD(var):
    fn = var.group(1)
    # use different MD.dat's for python 2 vs 3 incase user switches versions, as they are not compatible
    db = shelve.open('build/MDv' + str(sys.version_info[0]) + '.dat')
    if 'files' in db:
      files = db['files']
    else:
      files = {}
    file = readfile(fn)
    filemd5 = hashlib.md5(file.encode('utf8')).hexdigest()
    # check if file has already been parsed by the github api
    if fn in files and filemd5 in files[fn]:
      # use the stored copy if nothing has changed to avoid hitting the api more then the 60/hour when not signed in
      db.close()
      return files[fn][filemd5]
    else:
      url = 'https://api.github.com/markdown'
      payload = {'text': file, 'mode': 'markdown'}
      headers = {'Content-Type': 'application/json'}
      req = urllib2.Request(url, json.dumps(payload).encode('utf8'), headers)
      md = urllib2.urlopen(req).read().decode('utf8').replace('\n', '\\n').replace('\'', '\\\'')
      files[fn] = {}
      files[fn][filemd5] = md
      db['files'] = files
      db.close()
      return md

def loaderImage(var):
    fn = var.group(1)
    return 'data:image/png;base64,{0}'.format(base64.encodestring(open(fn, 'rb').read()).decode('utf8').replace('\n', ''))

def loadCode(ignore):
    return '\n\n;\n\n'.join(map(readfile, sorted(glob.glob('code/*.js'))))

def extractUserScriptMeta(var):
    m = re.search ( r"//[ \t]*==UserScript==\n.*?//[ \t]*==/UserScript==\n", var, re.MULTILINE|re.DOTALL )
    return m.group(0)

def latestDependencyModTime(script):
    patterns = ['@@INCLUDERAW:([0-9a-zA-Z_./-]+)@@', '@@INCLUDESTRING:([0-9a-zA-Z_./-]+)@@', '@@INCLUDEMD:([0-9a-zA-Z_./-]+)@@' '@@INCLUDEIMAGE:([0-9a-zA-Z_./-]+)@@']
    groupLastModDate = 0
    for pattern in patterns:
        files = re.findall(pattern,script)
        for file in files:
            lastModDate = os.path.getmtime(file)
            verbose and print ("...dependency " + file + ", last modified on " + str(lastModDate))
            if lastModDate > groupLastModDate:
                groupLastModDate = lastModDate
    return groupLastModDate

def doReplacements(script,updateUrl,downloadUrl,filename=None):

    script = re.sub('@@INJECTCODE@@',loadCode,script)
    script = re.sub('@@INCLUDERAW:([0-9a-zA-Z_./-]+)@@', loaderRaw, script)
    script = re.sub('@@INCLUDESTRING:([0-9a-zA-Z_./-]+)@@', loaderString, script)
    script = re.sub('@@INCLUDEMD:([0-9a-zA-Z_./-]+)@@', loaderMD, script)
    script = re.sub('@@INCLUDEIMAGE:([0-9a-zA-Z_./-]+)@@', loaderImage, script)

    script = script.replace('@@BUILDDATE@@', buildDate)
    script = script.replace('@@DATETIMEVERSION@@', dateTimeVersion)

    if resourceUrlBase:
        script = script.replace('@@RESOURCEURLBASE@@', resourceUrlBase)
    else:
        if '@@RESOURCEURLBASE@@' in script:
            raise Exception("Error: '@@RESOURCEURLBASE@@' found in script, but no replacement defined")

    script = script.replace('@@BUILDNAME@@', buildName)

    script = script.replace('@@UPDATEURL@@', updateUrl)
    script = script.replace('@@DOWNLOADURL@@', downloadUrl)

    if (filename):
        script = script.replace('@@PLUGINNAME@@', filename);
    if (filename):
        script = script.replace('@@FILENAME@@', filename);
    website = settings.get('website')
    if (website):
        script = script.replace('@@WEBSITE@@', website);
    return script

def saveScript(script,filePath):
    with io.open(filePath, 'w', encoding='utf8') as f:
        f.write(script)
    
def saveScriptAndMeta(script,ourDir,filename):
    fn = os.path.join(ourDir,filename)
    with io.open(fn, 'w', encoding='utf8') as f:
        f.write(script)
    metafn = fn.replace('.user.js', '.meta.js')
    if metafn != fn:
        with io.open(metafn, 'w', encoding='utf8') as f:
            meta = extractUserScriptMeta(script)
            f.write(meta)

def pathFilename(path): # Thanks to http://stackoverflow.com/questions/8384737/extract-file-name-from-path-no-matter-what-the-os-path-format
    return os.path.splitext(os.path.splitext(os.path.basename(path))[0])[0]

# Set directory values and create directories if missing
cwd = os.getcwd()
buildRoot = os.path.join(cwd, "build") #build should not be the root containing build.py, makefile, etc.
distRoot = cwd # it is okay if this is the same as buildRoot
docRoot = os.path.join(cwd, "docs")
srcRoot = os.path.join(cwd, "src")

if not os.path.exists(buildRoot):
    os.mkdir(buildRoot)

if not os.path.exists(distRoot):
    os.mkdir(distRoot)

if not os.path.isdir(docRoot):
    os.mkdir(os.path.join(cwd, "docs"))

# see if jsdoc2md is installed for JSDoc
jsdoc2md = shutil.which("jsdoc2md")
jsdocFiles = []

# run any preBuild commands
for cmd in settings.get('preBuild',[]):
    os.system ( cmd )


with io.open(os.path.join(distRoot, '.build-timestamp'), 'w') as f:
    f.write(u"" + time.strftime('%Y-%m-%d %H:%M:%S UTC', utcTime))
 
verbose and print ("Build source, minifications, and JSDocs")

fileIndex = 0
for fn in glob.glob("src/*.js"):
    verbose and print("Processing [" + str(fileIndex) + "] " + fn);
    filename = os.path.basename(fn);
    fnameNoExt = os.path.splitext(os.path.splitext(os.path.basename(fn))[0])[0]
    srcModTime = os.path.getmtime(fn) # Just note that the replacement strategy obfusactes file modification dates
    buildPath = os.path.join(buildRoot, filename)
    buildDir = os.path.dirname(buildPath)
    distPath = os.path.join(distRoot, filename)
    distDir = os.path.dirname(distPath)
    docPath = os.path.join(docRoot, fn.replace(".js",".md"))
    docDir = os.path.dirname(docPath)
    verbose and print("...buildPath is " + buildPath)
    verbose and print("...distPath is " + distPath)
    distFileModTime = os.path.getmtime(distPath) if os.path.exists(distPath) else 0
    buildFileModTime = os.path.getmtime(buildPath) if os.path.exists(buildPath) else 0
    script = readfile(fn)
    dependencyModTime = latestDependencyModTime(script)
    verbose and print ("..." + fn + ", last modified on " + str(srcModTime) + ", last modified dependency on " 
        + str(dependencyModTime) + ", build version last modified on " + str(buildFileModTime))
    if (srcModTime > buildFileModTime or dependencyModTime > buildFileModTime):
        downloadUrl = distUrlBase and distUrlBase + '/' + fn.replace("\\","/") or 'none'
        updateUrl = distUrlBase and downloadUrl.replace('.user.js', '.meta.js') or 'none'
        script = doReplacements(script, downloadUrl=downloadUrl, updateUrl=updateUrl, filename=fnameNoExt)
        saveScript(script, buildPath)
        if (distDir != buildDir):
            if not os.path.exists(distDir):
                verbose and print("...os.path.makedirs(" + distDir + ")")
                os.makedirs(distDir)
            shutil.copy2(buildPath, distPath)
        if minify:
            print("...minifying")
            minified = jsmin(script);
            minPrefixPath = os.path.join(os.path.dirname(fn), "minPreface.txt");
            if os.path.exists (minPrefixPath):
                prefix = readfile(minPrefixPath)
                prefix = doReplacements(prefix, downloadUrl=downloadUrl, updateUrl=updateUrl, filename=fnameNoExt)
                minified = prefix + minified
            minBuildPath = buildPath.replace('.js', '.min.js')
            saveScript(minified, minBuildPath);
            if (distDir != buildDir):
                minDistPath = distPath.replace('.js', '.min.js')
                shutil.copy2(minBuildPath, minDistPath)
    else:
        verbose and print ("...no need to build since distribution is older than dependencies")
    if jsdoc2md != None:
        possibleJSDoc = re.search("/\*\*[ \t\n\r]{1}",script, re.MULTILINE)
        buildFileModTime = os.path.getmtime(buildPath) if os.path.exists(buildPath) else 0;
        docFileModTime = os.path.getmtime(docPath) if os.path.exists(docPath) else 0;
        if (possibleJSDoc and (buildFileModTime > docFileModTime)): # this approach allows doc to be created outside this build.py
            if not os.path.exists(docDir):
                verbose and print("...os.path.makedirs(" + docDir + ")")
                os.makedirs(docDir)
            #docCmd = jsdoc2md + " " + os.path.join(cwd,os.path.join(outPath,fn)) + " > " + os.path.join(cwd,os.path.join("docs", os.path.basename(fn).replace(".js",".md")))
            docCmd = jsdoc2md + " " + buildPath + " > " + docPath
            verbose and print ("..." + docCmd)
            subprocess.call(docCmd)

    fileIndex = fileIndex + 1

# run any postBuild commands
for cmd in settings.get('postBuild',[]):
    os.system ( cmd )


# vim: ai si ts=4 sw=4 sts=4 et
