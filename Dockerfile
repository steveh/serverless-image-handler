FROM 679173355480.dkr.ecr.ap-southeast-2.amazonaws.com/lambda_runtime:bookworm-node-18-vips AS builder

RUN apt-get update && \
  apt-get install -y build-essential pkg-config rsync git && \
  rm -rf /var/lib/apt/lists/*

# Check vips dependencies are present
RUN pkg-config --modversion vips-cpp

WORKDIR /srv/source/image-handler/
COPY source/image-handler/package.json source/image-handler/package-lock.json /srv/source/image-handler/

RUN npm install --build-from-source

# # Check for jpeg2000 support
RUN node -e "process.exit(require('sharp').format.jp2k.input.file ? 0 : 1)"

COPY . /srv/

# Build
RUN npx tsc --build tsconfig.json
RUN npm prune --omit-dev
RUN rsync -avrq ./node_modules ./dist
RUN npm run include-solution-utils


FROM 679173355480.dkr.ecr.ap-southeast-2.amazonaws.com/lambda_runtime:bookworm-node-18-vips

COPY --from=builder /srv/source/image-handler/dist/ /srv/

CMD ["image-handler/index.handler"]
