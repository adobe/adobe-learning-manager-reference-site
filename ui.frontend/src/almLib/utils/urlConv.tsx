const MAP_Ember = {
    "skillLevel": {
        "1" : "beginnerSelected=true",
        "2" : "intermediateSelected=true",
        "3" : "advancedSelected=true"
    },
    "learnerState" :{
        "enrolled" : "enrolledSelected=true",
        "completed" : "completedSelected=true",
        "started" : "notenrolledSelected=true",
        "notenrolled" : "notenrolled=true"
    },
    "loFormat" :{
        "Activity" : "activitySelected=true",
        "Blended": "blendedSelected=true",
        "Self+Paced" : "selfPacedSelected=true",
        "Virtual+Classroom": "virtualClassroomSelected=true" ,
        "Classroom" : "classroomSelected=true"
    },
    "loTypes" : {
        "course" : "courseSelected=true",
        "learningProgram" : "lpsSelected=true",
        "jobAid" : "jobAidsSelected=true",
        "certification" : "certificationsSelected=true",
    },
    "duration" :{
        "0-1800" : "shortDurationSelected=true",
        "1801-7200" : "mediumDurationSelected=true",
        "7201-3600000" : "longDurationSelected=true",
    },
    "tagName" : "selectedTags=",
    "searchText":"searchText",
    "skillName": "selectedCategories=",
    "cities":"selectedCities=",
    "catalogs":"selectedListableCatalogIds=",

  
} as any;

const MAP_React ={
    "skillLevel": {
        "1" : "beginnerSelected",
        "2" : "intermediateSelected",
        "3" : "advancedSelected"
    },
    "learnerState" :{
        "enrolled" : "enrolledSelected",
        "completed" : "completedSelected",
        "started" : "notenrolledSelected",
        "notenrolled" : "notenrolled"
    },
    "loFormat" :{
        "Activity" : "activitySelected",
        "Blended": "blendedSelected",
        "Self Paced" : "selfPacedSelected",
        "Virtual Classroom": "virtualClassroomSelected" ,
        "Classroom" : "classroomSelected"
    },
    "loTypes" : {
        "course" : "courseSelected",
        "learningProgram" : "lpsSelected",
        "jobAid" : "jobAidsSelected",
        "certification" : "certificationsSelected",
    },
    "duration" :{
        "0-1800" : "shortDurationSelected",
        "1801-7200" : "mediumDurationSelected",
        "7201-3600000" : "longDurationSelected",
    },
    "selectedTags" : "tagName",
    "searchText":"searchText",
    "selectedCategories": "skillName",
    "selectedCities" : "cities",
    "selectedListableCatalogIds":"catalogs"
} as any;

function selectedTagsCoversion (uri : string){
    // function to create the format of params form '["a","b","c"]' to 'a,b,c'
    const temp = uri.replace(/"/g,'').replace("[","").replace("]","").split(",");
    return temp.toString();
}

export function convertUrlToEmber(){
    const url = new URL(window.location.href); 
    const paramsList = url.search.split("&");
    let dataMap = {} as any;
    if (paramsList.length === 0) {
        return "";
    }
    for (let i = 0; i < paramsList.length; i++) {
        paramsList[i] = decodeURIComponent( decodeURIComponent(paramsList[i]) );
        let tempStorage = paramsList[i].split("=");
        if (tempStorage[1] === undefined) {
            continue;
        }
        dataMap[tempStorage[0]] = tempStorage[1].split(",");
    }
    
    let str = "";
    for (const key in dataMap) {
        const newKey = key.replace(/\?/g,'').toString();
        if(newKey === "tagName" || newKey==="skillName" || newKey==="cities" || newKey==="catalogs"){
            let tempStr = []
            for (const iterator of dataMap[key]) {
                tempStr.push( "\""+iterator.toString() + "\"");
            }
            str += MAP_Ember[newKey] +"["+ tempStr+ "]&";
        }

        if(newKey==="searchText"){
            str += newKey+"="+dataMap[key]+'&';
        }
        
        for (const iterator of dataMap[key]) {
            if (MAP_Ember[newKey] === undefined) {
                continue;
            }
            if (MAP_Ember[newKey][iterator] === undefined) {
                continue;
            }
            str += MAP_Ember[newKey][iterator] + "&";
        }
        

    }
    return  str;
}
export function convertJsonToUri( obj : any){
    let str = "";
    for (const key in obj) {
        str += key + "=" + obj[key] + "&";
    }
    return str;
}
export function convertUrltoReact( params : any){
    const keys = Object.keys(params);
    let dataMap = {} as any;
    for (const key of keys) {
        if(key === "selectedTags" || key === "selectedCategories" || key==="selectedCities" ||key==="selectedListableCatalogIds"){
            dataMap[MAP_React[key]] = selectedTagsCoversion(params[key]);
            continue;
        }
        if(key === "searchText"){
            dataMap[key] = params[key];
            continue;
        }
        const temp = findKeysByValue(MAP_React , key)[0];
        if (temp === undefined) { continue; }
        const [ field , value ] = temp.split(".");
        if (dataMap[field] === undefined) { 
            dataMap[field] = [];
        }
        dataMap[field].push(value);
    }
    for (const key in dataMap) {
        dataMap[key] = dataMap[key].toString();
    }
    return dataMap;
} ;

function findKeysByValue(obj: any, value: any): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];

      if (val === value) {
        keys.push(key);
      } else if (typeof val === 'object') {
        const nestedKeys = findKeysByValue(val as any, value);
        keys.push(...nestedKeys.map((nestedKey) => `${key}.${nestedKey}`));
      }
    }
  }

  return keys;
}




