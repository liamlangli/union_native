// use std::vec::Vec;
// use rusty_v8 as v8;

// pub struct ClassDefine {
//     pub namespace: String,
//     pub properties: Vec<String>,
//     pub functions: Vec<String>,
//     pub instance_properties: Vec<String>,
//     pub instance_function: Vec<String>
// }

// pub struct ClassDefineBuilder {
//     pub define: Option<ClassDefine>
// }

// pub fn script_build_class() -> ClassDefineBuilder {
//     ClassDefineBuilder{
//         define: None
//     }
// }

// impl ClassDefineBuilder {
//     pub fn namespace(&self, namespace: &str) -> &Self {
//         self
//     }

//     pub fn function<T>(&self, name: &str, func: T) -> &Self {
//         self
//     }

//     pub fn property<G, S>(&self, name: &str, getter: G, setter: S) -> &Self {
//         self
//     }

//     pub fn instance_function<T>(&self, name: &str, func: T) -> &Self {
//         self
//     }

//     pub fn instance_property<G, S>(&self, name: &str, getter: G, setter: S) -> &Self {
//         self
//     }

//     pub fn build() -> v8::Local<v8::Value> {
//         None
//     }

// }