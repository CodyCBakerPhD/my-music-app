# Song Metadata

There are multiple YAML files to avoid having any single file that is too large to effectively manage.

The name of each YAML file is implicitly applied as a tag to each song it contains.

The contents of each YAML file are lists rather than dictionaries to provide the default ordering within automatically generated playlists by the combination of tags.

Custom ordering can be achieved by creating a separate YAML in the `manual_playlists` folder, named after the playlist; see `manual_playlists/Workout.yaml` as a good example.

Every playlist of one or two tags that holds more than two songs is generated, except duplicates of a playlist with a shorter name and the `Primary` tag on its own. Browse the result on the site's _Playlists_ tab.
