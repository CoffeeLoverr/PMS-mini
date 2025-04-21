IMAGE_NAME = avito-backend

CONTAINER_NAME = avito-backend-container

PORT = 8080

.PHONY: build run clean all stop

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):$(PORT) $(IMAGE_NAME)

stop:
	- docker stop $(CONTAINER_NAME)

clean:
	- docker stop $(CONTAINER_NAME) 
	- docker rm $(CONTAINER_NAME) 

initial-start: clean build run

clean-image:
	docker rmi $(IMAGE_NAME) 

clean-all: clean clean-image