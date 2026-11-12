{
  "targets": [
    {
      "target_name": "tree_sitter_toml",
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except"
      ],
      "include_dirs": [
        "src",
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "sources": [
        "src/parser.c",
        "src/scanner.c",
        "bindings/node/binding.cc"
      ],
      "conditions": [
        [
          "OS!='win'",
          {
            "cflags_c": [
              "-std=c99"
            ]
          },
          {
            "cflags_c": [
              "/std:c11",
              "/utf-8"
            ]
          }
        ]
      ]
    }
  ]
}
