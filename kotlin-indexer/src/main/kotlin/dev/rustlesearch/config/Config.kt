package dev.rustlesearch.config

import com.sksamuel.hoplite.ConfigLoader
import java.nio.file.Path
import java.nio.file.Paths

inline class Host(val v: String)
inline class Index(val v: String)
inline class Port(val v: Int)
data class ConfigElastic(val host: Host, val port: Port, val index: Index)
data class ConfigPaths(val orl: Path, val indexCache: Path)
data class Config(val elastic: ConfigElastic, val paths: ConfigPaths)

val config = ConfigLoader().loadConfigOrThrow<Config>(Paths.get("config.yml"))
