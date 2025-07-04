:!npx tsc --project ./tsconfig.json --showConfig  
{  
 "compilerOptions": {  
 "target": "es2021",  
 "module": "commonjs",  
 "declaration": true,  
 "outDir": "../../dist",  
 "esModuleInterop": true,  
 "skipLibCheck": true,  
 "moduleResolution": "node10",  
 "baseUrl": "../..",  
 "paths": {  
 "@maple/types": [
 "packages/types/src"
 ]  
 },  
 "jsx": "react-jsx",  
 "strict": true,  
 "allowSyntheticDefaultImports": true,  
 "noImplicitAny": true,  
 "noImplicitThis": true,  
 "strictNullChecks": true,  
 "strictFunctionTypes": true,  
 "strictBindCallApply": true,  
 "strictPropertyInitialization": true,  
 "strictBuiltinIteratorReturn": true,  
 "alwaysStrict": true,  
 "useUnknownInCatchVariables": true  
 },  
 "references": [
 {
 "path": "./tsconfig.app.json"
 },
 {
 "path": "./tsconfig.node.json"
 }
 ],  
 "include": [
 "../../src"
 ],  
 "exclude": [
 "../../node_modules",
 "../../dist"
 ]  
}
