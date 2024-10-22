packer {
  required_plugins {
    amazon = {
      version = ">=1.0.0, <2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}



variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0866a3c8686eaeeba"
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0d14511d8c7e6bf71"
}

variable "aws_access_key" {
  type    = string
  default = "AKIA4T4OB5DY6CDVXQ3C"
}

variable "aws_secret_key" {
  type    = string
  default = "qpYI2zq8+sbhBN+ds3mz1zelrFikJ634BC0mCy38"
}

variable "DB_NAME" {
  type    = string
  default = ""
}
variable "DB_USER" {
  type    = string
  default = ""
}
variable "DB_PASSWORD" {
  type    = string
  default = ""
}

variable "PORT" {
  type    = number
  default = 0
}

variable "DB_PORT" {
  type    = number
  default = 0
}

variable "HOST" {
  type    = string
  default = ""
}

variable "DIALECT" {
  type    = string
  default = ""
}

variable "ami_user_1" {
  type    = string
  default = ""
}

variable "ami_user_2" {
  type    = string
  default = ""
}



source "amazon-ebs" "my_ami" {
  access_key      = "${var.aws_access_key}"
  secret_key      = "${var.aws_secret_key}"
  region          =   "${var.aws_region}"
  ami_name        = "packer-example_${formatdate("YYYY_MM_DD", timestamp())}"
  ami_description = "An example ami created with packer"
  ami_users       = ["${var.ami_user_1}", "${var.ami_user_2}"]


  ami_regions = ["us-east-1"]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "t2.small"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 8
    volume_type           = "gp2"
    delete_on_termination = true //storage will be deleted when instance is terminated
  }

}

build {
  sources = ["source.amazon-ebs.my_ami", ]

  provisioner "shell" {
    environment_vars = ["DB_NAME=${var.DB_NAME}",
      "DB_USER=${var.DB_USER}",
    "DB_PASSWORD=${var.DB_PASSWORD}"]

    scripts = [
      "./scripts/update.sh",
      "./scripts/setup.sh",
      "./scripts/dbSetup.sh"
    ]
  }

  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/"
  }

  provisioner "file" {
    source      = "./systemD/systemDService.service"
    destination = "/tmp/"
  }

  provisioner "shell" {
    environment_vars = ["DB_NAME=${var.DB_NAME}",
      "DB_USER=${var.DB_USER}",
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_PORT=${var.DB_PORT}",
      "PORT= ${var.PORT}",
      "HOST=${var.HOST}",
    "DIALECT=${var.DIALECT}"]

    scripts = [
      "./scripts/unzip.sh",
      "./scripts/setDependencies.sh"
    ]
  }




}
