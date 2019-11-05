package dev.rustlesearch.pipelines

class SourceBuilder(config: PipelineConfig) {
    inner class RabbitMQSource() {

    }

    inner class RabbitToElastic(rabbitConfig: RabbitConfig, elasticConfig: ElasticConfig) {

    }

    inner class FileToElastic {

    }
}
