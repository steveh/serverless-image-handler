export AWS_REGION = ap-southeast-2

DOCKER_PLATFORM := linux/amd64
AWS_ACCOUNT_ID  := 679173355480
ECR_REGISTRY    := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

all: imagehandler
.PHONY: all

login:
	aws --region $(AWS_REGION) ecr get-login-password | docker login --username AWS --password-stdin $(ECR_REGISTRY)
.PHONY: login

imagehandler: TAG=0.4.0
imagehandler: source/**/*
	docker buildx build --pull --push --platform $(DOCKER_PLATFORM) --tag $(ECR_REGISTRY)/imagehandler:$(TAG) .
.PHONY: imagehandler
