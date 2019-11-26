package dev.rustlesearch.pipelines

import akka.NotUsed
import akka.stream.javadsl.Source
import java.io.File

object Sources {
   fun orlSource(path: String): Source<String, NotUsed> = Source.from(
       File(path).listFiles()?.map { it.absolutePath } ?: emptyList())
}
