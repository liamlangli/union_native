
pub struct Device {
    pub version: String
}

impl Device {
    pub fn new() -> Self {
        Self {
            version: String::from("0.0.1")
        }
    }
}

