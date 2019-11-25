package dev.rustlesearch.config

import com.sksamuel.hoplite.ConfigLoader
import java.nio.file.Path

inline class Port(val s: Int)
inline class Host(val s: String)
inline class Index(val s: String)
data class Elastic(val host: Host, val port: Port, val index: Index)
data class Paths(val orl: Path, val indexCache: Path)
data class Config(val elastic: Elastic, val paths: Paths)

val config = ConfigLoader().loadConfigOrThrow<Config>("config.yml")


