@Library(value='kids-first/aws-infra-jenkins-shared-libraries', changelog=false) _
ecs_service_type_1_standard {
    projectName                = "kf-ui-fhir-data-dashboard"
    orgFullName                = "kids-first"
    account                    = "kf-strides"
    environments               = "dev,qa,prd"
    docker_image_type          = "debian"
    create_default_iam_role    = "1"
    entrypoint_command         = "/start_up.sh"
    quick_deploy               = "true"
    container_port             = "80"
    health_check_path          = "/"
    external_config_repo       = "false"
    deploy_scripts_version     = "master"
    dependencies               = "ecr"
}
