use std::vec;
use rusty_v8 as v8;

struct ClassDefine {
    pub namespace: str,
    pub properties: vec<str>,
    pub functions: vec<str>,
    pub instance_properties: vec<str>,
    pub instance_function: vec<str>
}

struct ClassDefineBuilder {
    pub define: ClassDefine
}

pub fn script_build_class() -> ClassDefineBuilder {
    ClassDefineBuilder { define: ClassDefine() }
}

impl ClassDefineBuilder {
    pub fn namespace(&self, namespace: &str) -> Self {
        self.define.namespace = str;
        self
    }

    pub fn function<T>(&self, name: &str, func: T) -> Self {
        self
    }

    pub fn property<G, S>(&self, name: &str, getter: G, setter: S) -> Self {
        self
    }

    pub fn instance_function<T>(&self, name: &str, func: T) -> Self {
        self
    }

    pub fn instance_property<G, S>(&self, name: &str, getter: G, setter: S) -> Self {
        self
    }

    pub fn build() -> v8::Local<Value> {
    }
}