# actions-push-ecr

Github Actions that push docker image to ECR

## Usage

See `action.yml`

### Tag remote image

```yml
steps:
  - uses: loilo-inc/actions-push-ecr@v1.0.0
    with:
      pull-image: 12345678.dkr.ecr.us-east-1.amazonaws.com/my-service:abcdef
      push-image: 12345678.dkr.ecr.us-east-1.amazonaws.com/my-service:1.0.0
```

### Tag local image and push

```yml
steps:
  - uses: loilo-inc/actions-push-ecr@v1.0.0
    with:     
      local-image: my-service:abcde
      push-image: 12345678.dkr.ecr.us-east-1.amazonaws.com/my-service:1.0.0
```
